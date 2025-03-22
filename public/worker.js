// eslint-disable-next-line no-restricted-globals
addEventListener("message", (e) => {
  const { type, data, config } = e.data;

  switch (type) {
    case "pivot":
      const pivotResult = calculatePivot(data, config);
      postMessage({ type: "pivot", result: pivotResult });
      break;
    case "decision":
      const decisionResult = calculateDecisions(data, config);
      postMessage({ type: "decision", result: decisionResult });
      break;
    case "sortFilter":
      const sortFilterResult = processSortFilter(data, config);
      postMessage({ type: "sortFilter", result: sortFilterResult });
      break;
    case "stats":
      const statsResult = calculateStats(data);
      postMessage({ type: "stats", result: statsResult });
      break;
    default:
      postMessage({ error: "Unknown computation type" });
  }
});

function calculatePivot(data, { rowField, colField, valueField }) {
  const result = {};
  const rowValues = [...new Set(data.map((item) => item[rowField]))];
  const colValues = [...new Set(data.map((item) => item[colField]))];

  data.forEach((item) => {
    const rowKey = item[rowField];
    const colKey = item[colField];
    if (!result[rowKey]) result[rowKey] = {};
    result[rowKey][colKey] =
      (result[rowKey][colKey] || 0) + Number(item[valueField] || 0);
  });

  return { result, rowValues, colValues };
}

function calculateDecisions(data, { numericCols, weights }) {
  const normalizedData = data.map((item) => {
    const scores = {};
    let totalScore = 0;

    numericCols.forEach((col) => {
      const value = Number(item[col]);
      const colValues = data.map((d) => Number(d[col]));
      const max = Math.max(...colValues);
      const normalized = max ? value / max : 0;
      scores[col] = normalized * weights[col];
      totalScore += scores[col];
    });

    return { ...item, totalScore };
  });

  return normalizedData.sort((a, b) => b.totalScore - a.totalScore);
}

function processSortFilter(data, { filter, sortConfig, columns }) {
  let filteredData = [...data];

  if (filter) {
    filteredData = filteredData.filter((row) =>
      columns.some((col) =>
        String(row[col]).toLowerCase().includes(filter.toLowerCase())
      )
    );
  }

  if (sortConfig.key) {
    filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }

  return filteredData;
}

function calculateStats(numbers) {
  if (!numbers || Object.keys(numbers).length === 0) {
    return {};
  }

  const result = {};
  for (const [col, values] of Object.entries(numbers)) {
    const validNumbers = values.filter(
      (num) => !isNaN(num) && num !== null && num !== undefined
    );

    if (validNumbers.length === 0) {
      result[col] = { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
      continue;
    }

    const mean =
      validNumbers.reduce((sum, num) => sum + num, 0) / validNumbers.length;

    const sorted = [...validNumbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];

    const variance =
      validNumbers.reduce((sum, num) => {
        const diff = num - mean;
        return sum + diff * diff;
      }, 0) / validNumbers.length;
    const stdDev = Math.sqrt(variance);

    const min = Math.min(...validNumbers);
    const max = Math.max(...validNumbers);

    result[col] = { mean, median, stdDev, min, max };
  }

  return result;
}
