import makeRuntimeGraph from "./runtime-graph.js";
import makeGenreTable from "./genre-table.js";

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

  let selected = new Set(movies.flatMap((m) => m.listed_in));
  const setSelected = (newSelected) => {
    selected = newSelected;
    makeRuntimeGraph(
      d3.select("#graph3"),
      movies.filter((m) => m.release_year >= 1972),
      selected
    );

    makeGenreTable(d3.select("#graph1"), movies, selected, setSelected);
  };
  window.addEventListener("resize", () => setSelected(selected));
  setSelected(selected);
})();
