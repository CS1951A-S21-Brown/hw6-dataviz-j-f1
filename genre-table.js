import { graph_1_width } from "./util.js";

// Heavily modified from an earlier chart I published here: https://observablehq.com/@j-f1/dear-blueno-analysis
export default function (target, movies, selected, setSelected) {
  const table = target
    .html("")
    .append("table")
    .style("margin", "1em")
    .style("width", graph_1_width + "px");
  const data = movies.reduce((acc, movie) => {
    for (const genre of movie.listed_in) {
      if (!acc.has(genre)) acc.set(genre, []);
      acc.get(genre).push(movie);
    }
    return acc;
  }, new Map());

  const header = table.append("thead").append("tr");

  header
    .append("th")
    .append("input")
    .attr("type", "checkbox")
    .attr("id", "checkbox-all")
    .property("checked", selected.size === data.size)
    .property("indeterminate", selected.size && selected.size < data.size)
    .on("change", () =>
      setSelected(selected.size ? new Set() : new Set(data.keys()))
    );
  header
    .append("th")
    .append("label")
    .style("margin", "0")
    .attr("for", "checkbox-all")
    .text("Genre");
  header.append("th").text("Number of films");

  const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .enter()
    .append("tr");

  const makeId = (name) => `checkbox-${name.replace(/[^\w]+/g, "_")}`;

  rows
    .append("td")
    .style("width", "20px")
    .append("input")
    .attr("type", "checkbox")
    .property("checked", (d) => selected.has(d[0]))
    .attr("id", (d) => makeId(d[0]))
    .on("change", (_, d) =>
      setSelected(
        selected.has(d[0])
          ? new Set([...selected].filter((name) => name !== d[0]))
          : new Set([...selected, d[0]])
      )
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
    .text((d) => d3.format(",")(d[1].length));
}
