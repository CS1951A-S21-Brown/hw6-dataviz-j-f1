export function addOutlinedLabel(parent, text, width = 4) {
  const g = parent.append("g");
  g.append("text")
    .attr("stroke", "white")
    .attr("stroke-width", width)
    .text(text);
  g.append("text").text(text);
  return g;
}

export const formatNumber = d3.format(",");
export const margin = { top: 100, right: 30, bottom: 40, left: 70 };

export const BREAKPOINT = 992;
export const MAX_HEIGHT = 720;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
export const graph_1_width = () =>
    (window.innerWidth < BREAKPOINT
      ? window.innerWidth
      : (window.innerWidth * 5) / 12) - 32,
  graph_1_height = () => 250;
export const graph_2_width = () =>
    window.innerWidth < BREAKPOINT
      ? window.innerWidth
      : (window.innerWidth * 7) / 12,
  graph_2_height = () => 515 + 60;
export const graph_3_width = () => window.innerWidth / 2,
  graph_3_height = () => 575;
