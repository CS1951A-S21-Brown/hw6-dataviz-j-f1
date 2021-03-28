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
  let year = 1972;
  let sort = "genre";
  const setState = (updated) => {
    genres = updated.genres || genres;
    showPairs = updated.showPairs != null ? updated.showPairs : showPairs;
    year = updated.year ?? year;
    sort = updated.sort || sort;

    const filteredMovies = movies.filter((m) => m.release_year >= year);

    makeGenreTable(
      d3.select("#graph1"),
      movies,
      year,
      { genres, sort },
      setState
    );
    document.getElementById("net-explanation").hidden = !showPairs;
    if (showPairs) {
      actorsDirectors(d3.select("#graph2"), filteredMovies, genres);
    } else {
      makeRuntimeGraph(d3.select("#graph2"), filteredMovies, genres, year);
    }
  };
  window.addEventListener("resize", () => setState({}));

  document.querySelector("form").onsubmit = (e) => e.preventDefault();
  let timeout;
  document.getElementById("year-input").oninput = (e) => {
    const value = e.target.valueAsNumber;
    if (value >= 1942 && value <= 2020) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(
        () => setState({ year: value }),
        showPairs ? 300 : 0
      );
      e.target.setCustomValidity("");
      e.target.reportValidity();
    } else {
      e.target.setCustomValidity("enter a value between 1942 and 2020");
      e.target.reportValidity();
    }
  };

  d3.selectAll("[name=graph-type]")
    .data([false, true])
    .on("change", (_, showPairs) => {
      setState({ showPairs });
    });

  setState({});
})();
