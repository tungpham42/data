import React, { useState, useEffect } from "react";
import { Card, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

function StatisticsPanel({ data, columns }) {
  const numericColumns = columns.filter((col) =>
    data.every((item) => !isNaN(Number(item[col])))
  );
  const [stats, setStats] = useState({});
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof Worker === "undefined") {
      console.warn("Web Workers not supported");
      return;
    }

    const worker = new Worker("/worker.js");
    worker.onmessage = (e) => {
      if (e.data.type === "stats") {
        setStats(e.data.result);
      }
    };
    worker.onerror = (error) => console.error("Worker error:", error);

    const statsData = numericColumns.reduce((acc, col) => {
      acc[col] = data.map((item) => Number(item[col]));
      return acc;
    }, {});

    worker.postMessage({ type: "stats", data: statsData });

    return () => worker.terminate();
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
}

export default StatisticsPanel;
