import React, { useState, useMemo } from "react";
import { Card, Form, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

const DecisionMaker = React.memo(({ data, columns }) => {
  const numericCols = useMemo(
    () =>
      columns.filter((col) => data.every((item) => !isNaN(Number(item[col])))),
    [data, columns]
  );
  const [weights, setWeights] = useState(() =>
    Object.fromEntries(numericCols.map((col) => [col, 1]))
  );
  const [decisionResults, setDecisionResults] = useState(null);
  const { t } = useLanguage();

  const calculateDecisions = () => {
    const computeDecisions = (data, cols, weights) => {
      return data
        .map((item) => {
          const totalScore = cols.reduce(
            (sum, col) => sum + Number(item[col]) * weights[col],
            0
          );
          return { ...item, totalScore };
        })
        .sort((a, b) => b.totalScore - a.totalScore);
    };

    if (typeof Worker !== "undefined") {
      const worker = new Worker("/worker.js");
      worker.onmessage = (e) => {
        if (e.data.type === "decision") setDecisionResults(e.data.result);
        worker.terminate();
      };
      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setDecisionResults(computeDecisions(data, numericCols, weights));
      };
      worker.postMessage({
        type: "decision",
        data,
        config: { numericCols, weights },
      });
    } else {
      setDecisionResults(computeDecisions(data, numericCols, weights));
    }
  };

  const handleWeightChange = (col, value) => {
    setWeights((prev) => ({ ...prev, [col]: Number(value) }));
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          <FontAwesomeIcon icon={faCalculator} className="me-2" />
          {t("decision_maker_title")}
        </Card.Title>
        <Form>
          {numericCols.map((col) => (
            <Form.Group key={col} className="mb-2">
              <Form.Label>
                {col} {t("weight_label")}
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.1"
                value={weights[col]}
                onChange={(e) => handleWeightChange(col, e.target.value)}
              />
            </Form.Group>
          ))}
          <Button onClick={calculateDecisions} className="mt-2">
            <FontAwesomeIcon icon={faPlay} className="me-1" />
            {t("calculate_decisions")}
          </Button>
        </Form>
        {decisionResults && (
          <div className="table-responsive mt-3">
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                  <th>{t("score")}</th>
                </tr>
              </thead>
              <tbody>
                {decisionResults.slice(0, 5).map((item, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td key={col}>{item[col]}</td>
                    ))}
                    <td>{item.totalScore.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
});

export default DecisionMaker;
