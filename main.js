import makeRuntimeGraph from "./runtime-graph.js";
import makeGenreTable from "./genre-table.js";
import actorsDirectors from "./actors-directors.js";

const delist = (s) => s.split(", ").filter(Boolean);
const parseDate = d3.timeParse("%B %-d, %Y");
(async () => {
  const data = await d3.csv("data/netflix.csv", (d) => ({
    cast: delist(d.cast),
    country: delist(d.country),
    date_added: parseDate(d.date_added),
    description: d.description,
    director: delist(d.director),
    duration: d.duration,
    listed_in: delist(d.listed_in),
    rating: d.rating,
    release_year: +d.release_year,
    title: d.title,
    type: d.type,
  }));

  const movies = data
    .filter((d) => d.type === "Movie")
    .map(({ duration, ...m }) => ({ ...m, minutes: parseInt(duration) }));
  const shows = data
    .filter((d) => d.type === "TV Show")
    .map(({ duration, ...m }) => ({ ...m, seasons: parseInt(duration) }));

  let genres = new Set(movies.flatMap((m) => m.listed_in));
  let showPairs = false;
  const setState = (updated) => {
    genres = updated.genres ?? genres;
    showPairs = updated.showPairs ?? showPairs;

    makeGenreTable(d3.select("#graph1"), movies, genres, (genres) =>
      setState({ genres })
    );
    if (showPairs) {
      actorsDirectors(d3.select("#graph2"), movies, genres);
    } else {
      makeRuntimeGraph(
        d3.select("#graph2"),
        movies.filter((m) => m.release_year >= 1972),
        genres
      );
    }
  };
  window.addEventListener("resize", () => setState({}));

  d3.selectAll("[name=graph-type]")
    .data([false, true])
    .on("change", (_, showPairs) => {
      setState({ showPairs });
    });

  setState({});
})();
