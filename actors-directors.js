import { graph_2_width, graph_2_height, margin } from "./util.js";

export default function actorsDirectors(target, movies, genres) {
  const svg = target
    .html("")
    .attr("class", "")
    .append("svg")
    .attr("width", graph_2_width())
    .attr("height", graph_2_height())
    .append("g");

  const data = [
    ...movies
      .filter((m) => m.listed_in.some((g) => genres.has(g)))
      .reduce((acc, movie) => {
        for (const pair of d3
          .cross(movie.cast, movie.cast)
          .filter(([a, b]) => a < b)) {
          // only include each pair once
          if (!acc.has(pair)) acc.set(pair, []);
          acc.get(pair).push(movie);
        }
        return acc;
      }, new d3.InternMap([], JSON.stringify)),
  ];
  data.sort((a, b) => b[1].length - a[1].length);

  const links = data
    .map(([[source, target], movies]) => ({
      source,
      target,
      strength: movies.length,
    }))
    .filter((d) => d.strength > 2);
  const nodes = [
    ...new Set(links.flatMap((d) => [d.source, d.target])),
  ].map((d) => ({ id: d }));

  const offset = 50;
  const sim = d3
    .forceSimulation()
    .nodes(nodes)
    .velocityDecay(0.2)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-3).distanceMax(200))
    .force("top", d3.forceY(-offset).strength(0.005))
    .force("bottom", d3.forceY(graph_2_height() + offset).strength(0.005))
    .force("left", d3.forceX(0).strength(0.002))
    .force("right", d3.forceX(graph_2_width()).strength(0.002))
    .force("center", d3.forceCenter(graph_2_width() / 2, graph_2_height() / 2))
    .force("radius", d3.forceCollide(5));

  sim.tick(30);

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value));

  const node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", "red");
  // .call(drag(simulation));

  sim.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });
}
