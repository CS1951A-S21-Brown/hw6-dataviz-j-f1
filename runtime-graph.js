import {
  addOutlinedLabel,
  margin,
  graph_2_width,
  graph_2_height,
} from "./util.js";

const COLOR = "#7846b5";
export default function (target, movies, selected, year) {
  const width = graph_2_width() - margin.left - margin.right;
  const height = graph_2_height() + 160 - margin.top - margin.bottom;
  const svg = target
    .html("")
    .attr("class", "runtime-graph")
    .append("svg")
    .attr("width", graph_2_width())
    .attr("height", graph_2_height() + 160)
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

  const x = d3.scaleLinear([year, 2020], [0, width]);
  const y = d3.scaleLinear([210, 0], [0, height]).nice();

  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, -45)`)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text(`Average runtime by year (${year}–Present)`);
  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, -27)`)
    .attr("text-anchor", "middle")
    .text(
      "light purple region depicts full range of runtimes for the given year"
    );
  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, -10)`)
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
    .call(d3.axisBottom(x).ticks(50, "d"))
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
    .attr("fill", COLOR)
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
    .attr("stroke", COLOR)
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
    .attr("x", data.length === 1 ? 0 : (d) => x(d.year - 0.5))
    .attr("y", 0)
    .attr("width", data.length === 1 ? width : (d) => x(d.year) - x(d.year - 1))
    .attr("height", height)
    .classed("hoverable", true)
    .attr("fill", "transparent");

  const hovertip = hovers
    .append("g")
    .attr("font-size", 15)
    .classed("hover-target", true)
    .attr("pointer-events", "none")
    .attr("transform", (d) => `translate(${x(d.year)}, ${y(d.runtime)})`);

  hovertip
    .append("line")
    .attr("x0", 0)
    .attr("x1", 0)
    .attr("y0", 0)
    .attr("y1", y.range()[1] + 22)
    .attr("transform", (d) => `translate(0, ${-y(d.runtime)})`)
    .attr("stroke", "white")
    .attr("stroke-width", 5);
  hovertip
    .append("line")
    .attr("x0", 0)
    .attr("x1", 0)
    .attr("y0", 0)
    .attr("y1", y.range()[1] + 10)
    .attr("transform", (d) => `translate(0, ${-y(d.runtime)})`)
    .attr("stroke", COLOR);

  hovertip
    .append("circle")
    .attr("r", 5)
    .attr("fill", COLOR)
    .style("opacity", (d) => {
      if (data.length === 1) return 1;
      const idx = data.findIndex((el) => el.year === d.year);
      return idx === 0 ||
        idx === data.length - 1 ||
        data[idx - 1].runtime != null ||
        data[idx + 1].runtime != null
        ? null
        : 1;
    });

  addOutlinedLabel(hovertip, (d) => d.year, 5)
    .attr("transform", (d) => `translate(0, ${y(0) - y(d.runtime) + 24})`)
    .attr("text-anchor", "middle");

  addOutlinedLabel(hovertip, (d) => Math.round(d.runtime) + "m")
    .attr("transform", "translate(-10, 5)")
    .attr("text-anchor", "end");

  const extremities = hovertip.append("g").attr("text-anchor", "middle");

  addOutlinedLabel(extremities, (d) => `min: ${Math.round(d.minRuntime)}m`)
    .attr("hidden", (d) => (d.minRuntime === d.runtime ? "" : null))
    .attr(
      "transform",
      (d) => `translate(0, ${Math.max(30, y(d.minRuntime) - y(d.runtime))})`
    );

  addOutlinedLabel(extremities, (d) => `max: ${Math.round(d.maxRuntime)}m`)
    .attr("hidden", (d) => (d.maxRuntime === d.runtime ? "" : null))
    .attr(
      "transform",
      (d) =>
        `translate(0, ${Math.min(
          -22,
          y(Math.min(d.maxRuntime, 250)) - y(d.runtime)
        )})`
    );
}
