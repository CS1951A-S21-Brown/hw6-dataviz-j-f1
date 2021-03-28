import { graph_2_width, graph_2_height } from "./util.js";

export default function actorsDirectors(target, movies) {
  target.html("");

  const rawData = movies.reduce((acc, movie) => {
    for (const director of movie.director) {
      for (const actor of movie.cast) {
        const key = [director, actor];
        if (!acc.has(key)) acc.set(key, []);
        acc.get(key).push(movie);
      }
    }
    return acc;
  }, new d3.InternMap([], JSON.stringify));
  const data = [];
  for (const [key, value] of rawData) {
    if (value.length > 2) {
      data.push([...key, value]);
    }
  }
  data.sort((a, b) => b[2].length - a[2].length);
}
