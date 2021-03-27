export function addOutlinedLabel(parent, text) {
  const g = parent.append("g");
  g.append("text").attr("stroke", "white").attr("stroke-width", 3).text(text);
  g.append("text").text(text);
  return g;
}
export const margin = { top: 40, right: 100, bottom: 40, left: 100 };

export const MAX_WIDTH = Math.max(1080, window.innerWidth);
export const MAX_HEIGHT = 720;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
export const graph_1_width = MAX_WIDTH / 2 - 10,
  graph_1_height = 250;
export const graph_2_width = MAX_WIDTH / 2 - 10,
  graph_2_height = 275;
export const graph_3_width = MAX_WIDTH / 2,
  graph_3_height = 575;
