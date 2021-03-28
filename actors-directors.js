import {
  graph_2_width,
  graph_2_height,
  addOutlinedLabel,
  formatNumber,
} from "./util.js";

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

  let links = data.map(([[source, target], movies]) => ({
    source,
    target,
    strength: movies.length,
  }));
  let nodes;

  let minSize = 0;
  do {
    links = links.filter((d) => d.strength >= minSize);
    nodes = [
      ...new Set(links.flatMap((d) => [d.source, d.target])),
    ].map((d) => ({ id: d }));
    minSize++;
  } while (nodes.length > 700 || links.length > 1900);

  let coloridx = 0;

  const colors = d3.schemeCategory10.concat(
    d3.schemeSet3.map((c) => d3.color(c).darker().formatHex())
  );
  for (const node of nodes) {
    if (node.color) continue;
    const color = colors[coloridx];
    coloridx = (coloridx + 1) % colors.length;

    const queue = [node.id];
    const seen = new Set();
    while (queue.length) {
      const neighborId = queue.pop();
      if (seen.has(neighborId)) continue;
      seen.add(neighborId);

      const neighbor = nodes.find((n) => n.id === neighborId);
      neighbor.color = color;
      neighbor.links = links.filter(
        (l) => l.source === neighborId || l.target === neighborId
      );
      queue.push(
        ...neighbor.links.map((l) =>
          l.source === node.id ? l.target : l.source
        )
      );
    }
  }

  const offset = 50;
  const sim = d3
    .forceSimulation()
    .nodes(nodes)
    .velocityDecay(0.15)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-5).distanceMax(200))
    .force("top", d3.forceY(0).strength(0.0055))
    .force("bottom", d3.forceY(graph_2_height() + offset).strength(0.0055))
    .force("left", d3.forceX(0).strength(0.003))
    .force("right", d3.forceX(graph_2_width()).strength(0.003))
    .force("center", d3.forceCenter(graph_2_width() / 2, graph_2_height() / 2))
    .force("radius", d3.forceCollide(12));

  sim.tick(50);

  const link = svg
    .append("g")
    .attr("stroke", "black")
    .attr("stroke-opacity", 0.3)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value));

  const node = svg
    .append("g")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr(
      "r",
      (d) => d3.max(d.links.map((d) => d.strength)) ** 0.55 * (5 - minSize / 2)
    )
    .attr("fill", (d) => d.color);
  node
    .append("title")
    .text(
      (d) =>
        d.id +
        " acted with \n\n" +
        d.links
          .map(
            ({ source, target, strength }) =>
              `${source.id === d.id ? target.id : source.id}: ${strength} film${
                strength == 1 ? "" : "s"
              }`
          )
          .join("\n")
    );

  sim.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  addOutlinedLabel(
    svg,
    `Cutoff: at least ${minSize} shared film${minSize == 1 ? "" : "s"}`
  )
    .attr("transform", "translate(0, 40)")
    .attr("pointer-events", "none");
  addOutlinedLabel(
    svg,
    `${formatNumber(nodes.length)} actors visible with ${formatNumber(
      links.length
    )} connections`
  )
    .attr("transform", "translate(0, 20)")
    .attr("pointer-events", "none");
}
