import { graph_1_width, formatNumber } from "./util.js";

// Heavily modified from an earlier chart I published here: https://observablehq.com/@j-f1/dear-blueno-analysis
export default function (target, allMovies, year, state, setState) {
  const table = target
    .html("")
    .append("table")
    .style("width", graph_1_width() + "px");
  const data = d3.sort(
    [
      ...allMovies.reduce((acc, movie) => {
        for (const genre of movie.listed_in) {
          if (!acc.has(genre)) acc.set(genre, []);
          acc.get(genre).push(movie);
        }
        return acc;
      }, new Map()),
    ].map(([genre, movies]) => [
      genre,
      movies.filter((m) => m.release_year >= year),
    ]),
    state.sort === "genre" ? (d) => d[0] : (d) => -d[1].length
  );
  const header = table.append("thead").append("tr");

  header
    .append("th")
    .append("input")
    .attr("type", "checkbox")
    .attr("id", "checkbox-all")
    .property(
      "checked",
      [...data].every(([genre]) => state.genres.has(genre))
    )
    .property(
      "indeterminate",
      state.genres.size && [...data].some(([genre]) => !state.genres.has(genre))
    )
    .on("change", () =>
      setState({ genres: state.genres.size ? new Set() : new Set(data.keys()) })
    );
  const genreHeader = header.append("th");
  genreHeader.append("span").text("Genre ");
  genreHeader
    .append("button")
    .text("sort a-z")
    .attr("class", "btn btn-sm btn-link")
    .property("disabled", state.sort === "genre")
    .style("padding", 0)
    .style("font-size", "inherit")
    .on("click", () => setState({ sort: "genre" }));

  const countHeader = header.append("th");
  countHeader
    .append("span")
    .text(
      `Number of films (total: ${formatNumber(
        allMovies.filter((m) => m.release_year >= year).length
      )}) `
    );
  countHeader
    .append("button")
    .text("sort by")
    .attr("class", "btn btn-sm btn-link")
    .property("disabled", state.sort === "count")
    .style("padding", 0)
    .style("font-size", "inherit")
    .on("click", () => setState({ sort: "count" }));

  const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .enter()
    .append("tr")
    .style("color", (d) => (d[1].length === 0 ? "gray" : "inherit"));
  const makeId = (name) => `checkbox-${name.replace(/[^\w]+/g, "_")}`;

  rows
    .append("td")
    .style("width", "20px")
    .append("input")
    .attr("type", "checkbox")
    .property("disabled", (d) => d[1].length === 0)
    .property("indeterminate", (d) => d[1].length === 0)
    .property("checked", (d) => state.genres.has(d[0]))
    .attr("id", (d) => makeId(d[0]))
    .on("change", (_, d) =>
      setState({
        genres: state.genres.has(d[0])
          ? new Set([...state.genres].filter((name) => name !== d[0]))
          : new Set([...state.genres, d[0]]),
      })
    );

  rows
    .append("td")
    .style("padding-right", "1em")
    .style("width", "200px")
    .append("label")
    .style("margin", "0")
    .style("font-weight", "normal")
    .attr("for", (d) => makeId(d[0]))
    .text((d) => d[0]);

  const maxCount = d3.max(data, (d) => d[1].length);
  rows
    .append("td")
    .style("--width", (d) => `${(d[1].length / maxCount) * 100}%`)
    .attr("data-text", (d) => d3.format(",")(d[1].length))
    .classed("with-bar", true)
    .text((d) => formatNumber(d[1].length));
}
