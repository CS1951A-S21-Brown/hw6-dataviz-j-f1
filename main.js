// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 100, bottom: 40, left: 100 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = MAX_WIDTH / 2 - 10,
  graph_1_height = 250;
let graph_2_width = MAX_WIDTH / 2 - 10,
  graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2,
  graph_3_height = 575;

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

  constructRuntimeByYear(movies, MAX_WIDTH - margin.left - margin.right);
})();

function addOutlinedLabel(parent, text) {
  const g = parent.append("g");
  g.append("text").attr("stroke", "white").attr("stroke-width", 3).text(text);
  g.append("text").text(text);
  return g;
}

function constructRuntimeByYear(movies, width) {
  const height = MAX_HEIGHT - margin.top - margin.bottom;
  const svg = d3
    .select("#graph1")
    .append("svg")
    .attr("width", MAX_WIDTH)
    .attr("height", MAX_HEIGHT)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const data = d3
    .groups(movies, (d) => d.release_year)
    .map(([year, movies]) => ({
      year,
      minRuntime: d3.min(movies, (d) => d.minutes),
      runtime: d3.mean(movies, (d) => d.minutes),
      maxRuntime: d3.max(movies, (d) => d.minutes),
    }));

  for (
    let year = d3.min(movies, (d) => d.release_year);
    year <= d3.max(movies, (d) => d.release_year);
    year++
  ) {
    if (!data.some((d) => d.year === year)) data.push({ year });
  }
  data.sort((a, b) => a.year - b.year);

  const x = d3.scaleLinear(
    d3.extent(data, (d) => d.year),
    [0, width]
  );
  const y = d3
    .scaleLinear([d3.max(movies, (d) => d.minutes), 0], [0, height])
    .nice();

  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, -25)`)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("Average runtime by year");
  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, -7)`)
    .attr("text-anchor", "middle")
    .text("gray region depicts full range of runtimes for the given year");
  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, 10)`)
    .attr("text-anchor", "middle")
    .text("hover graph to view details");

  svg
    .append("text")
    .attr("transform", `translate(-50, ${height / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("Average runtime (minutes)");

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(20, "d"))
    .selectAll("text")
    .remove();
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(10, "d").tickSize(10));

  const area = d3
    .area()
    .x((d) => x(d.year))
    .y0((d) => y(d.minRuntime))
    .y1((d) => y(d.maxRuntime))
    .defined((d) => d.runtime)
    .curve(d3.curveCardinal);
  svg
    .append("path")
    .attr("stroke-width", "2")
    .attr("fill", "black")
    .attr("opacity", 0.25)
    .attr("d", area(data));

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.runtime))
    .defined((d) => d.runtime)
    .curve(d3.curveCardinal);
  svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke-width", "3")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("d", line(data));

  const hovers = svg
    .append("g")
    .selectAll("g")
    .data(data.filter((d) => d.runtime))
    .enter()
    .append("g");
  hovers
    .append("rect")
    .attr("x", (d) => x(d.year))
    .attr("y", 0)
    .attr("width", (d) => x(d.year) - x(d.year - 1))
    .attr("height", height)
    .classed("hoverable", true)
    .attr("fill", "transparent");

  const hovertip = hovers
    .append("g")
    .attr("font-size", 15)
    .classed("hover-target", true)
    .attr("pointer-events", "none")
    .attr("transform", (d) => `translate(${x(d.year)}, ${y(d.runtime)})`);

  hovertip.append("circle").attr("r", 5).attr("fill", "rebeccapurple");
  addOutlinedLabel(hovertip, (d) => d.year)
    .attr("transform", "translate(-10, 5)")
    .attr("text-anchor", "end");

  addOutlinedLabel(hovertip, (d) => Math.round(d.runtime) + "m").attr(
    "transform",
    "translate(10, 5)"
  );
}
