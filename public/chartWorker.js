// eslint-disable-next-line no-restricted-globals
addEventListener("message", (e) => {
  const { data, xAxis, yAxes } = e.data;

  // Compute xAxis categories
  const categories = data.map((item) => item[xAxis]);

  // Compute series data
  const series = yAxes.map((yAxis) => ({
    name: yAxis,
    data: data.map((item) => Number(item[yAxis])),
  }));

  postMessage({ categories, series });
});
