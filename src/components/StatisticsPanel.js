import React, { useState, useEffect, useMemo } from "react";
import { Card, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

const StatisticsPanel = React.memo(({ data, columns }) => {
  const numericColumns = useMemo(
    () =>
      columns.filter((col) => data.every((item) => !isNaN(Number(item[col])))),
    [data, columns]
  );
  const [stats, setStats] = useState({});
  const { t } = useLanguage();

  useEffect(() => {
    if (!numericColumns.length) return;

    const computeStats = (data, cols) => {
      const result = {};
      cols.forEach((col) => {
        const values = data
          .map((item) => Number(item[col]))
          .filter((v) => !isNaN(v));
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const stdDev = Math.sqrt(
          values.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
            values.length
        );
        result[col] = {
          mean,
          median,
          stdDev,
          min: Math.min(...values),
          max: Math.max(...values),
        };
      });
      return result;
    };

    if (typeof Worker !== "undefined") {
      const worker = new Worker("/worker.js");
      worker.onmessage = (e) => {
        if (e.data.type === "stats") setStats(e.data.result);
      };
      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setStats(computeStats(data, numericColumns));
      };

      const statsData = numericColumns.reduce((acc, col) => {
        acc[col] = data.map((item) => Number(item[col]));
        return acc;
      }, {});
      worker.postMessage({ type: "stats", data: statsData });

      return () => worker.terminate();
    } else {
      setStats(computeStats(data, numericColumns));
    }
  }, [data, numericColumns]);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          <FontAwesomeIcon icon={faChartPie} className="me-2" />
          {t("statistics_title")}
        </Card.Title>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>{t("column")}</th>
              <th>{t("mean")}</th>
              <th>{t("median")}</th>
              <th>{t("std_dev")}</th>
              <th>{t("min")}</th>
              <th>{t("max")}</th>
            </tr>
          </thead>
          <tbody>
            {numericColumns.map((col) =>
              stats[col] ? (
                <tr key={col}>
                  <td>{col}</td>
                  <td>{stats[col].mean.toFixed(2)}</td>
                  <td>{stats[col].median.toFixed(2)}</td>
                  <td>{stats[col].stdDev.toFixed(2)}</td>
                  <td>{stats[col].min}</td>
                  <td>{stats[col].max}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
});

export default StatisticsPanel;
