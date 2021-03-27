import {
  addOutlinedLabel,
  margin,
  graph_2_width,
  graph_2_height,
} from "./util.js";

export default function (target, movies, selected) {
  const width = graph_2_width() - margin.left - margin.right;
  const height = graph_2_height() - margin.top - margin.bottom;
  const svg = target
    .html("")
    .append("svg")
    .attr("width", graph_2_width())
    .attr("height", graph_2_height())
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const data = d3
    .groups(
      movies.filter((m) => m.listed_in.some((g) => selected.has(g))),
      (d) => d.release_year
    )
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

  const x = d3.scaleLinear([1972, 2020], [0, width]);
  const y = d3
    .scaleLinear(
      [
        Math.min(
          d3.max(movies, (d) => d.minutes),
          250
        ),
        0,
      ],
      [0, height]
    )
    .nice();

  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, -25)`)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("Average runtime by year (1972–present)");
  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, -7)`)
    .attr("text-anchor", "middle")
    .text(
      "light purple region depicts full range of runtimes for the given year"
    );
  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, 10)`)
    .attr("text-anchor", "middle")
    .text("hover graph to view details");

  svg
    .append("text")
    .attr("transform", `translate(-40, ${height / 2}) rotate(-90)`)
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
    .attr("fill", "#7846b5")
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
    .attr("stroke", "#7846b5")
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
    .classed("hoverable", (d) => {
      const idx = data.findIndex((el) => el.year === d.year);
      return (
        idx === 0 ||
        idx === data.length - 1 ||
        data[idx - 1].runtime != null ||
        data[idx + 1].runtime != null
      );
    })
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
  addOutlinedLabel(hovertip, (d) => `min: ${Math.round(d.minRuntime)}m`)
    .attr("hidden", (d) => (d.minRuntime === d.runtime ? "" : null))
    .attr("transform", (d) => `translate(0, ${y(d.minRuntime) - y(d.runtime)})`)
    .attr("text-anchor", "middle");
  addOutlinedLabel(hovertip, (d) => `max: ${Math.round(d.maxRuntime)}m`)
    .attr("hidden", (d) => (d.maxRuntime === d.runtime ? "" : null))
    .attr(
      "transform",
      (d) => `translate(0, ${y(Math.min(d.maxRuntime, 250)) - y(d.runtime)})`
    )
    .attr("text-anchor", "middle");
}
