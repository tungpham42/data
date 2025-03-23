import React, { useState } from "react";
import { Card, Form, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

function DecisionMaker({ data, columns }) {
  const numericCols = columns.filter((col) =>
    data.every((item) => !isNaN(Number(item[col])))
  );
  const [weights, setWeights] = useState(
    Object.fromEntries(numericCols.map((col) => [col, 1]))
  );
  const [decisionResults, setDecisionResults] = useState(null);
  const { t } = useLanguage();

  const calculateDecisions = () => {
    if (typeof Worker === "undefined") {
      console.warn("Web Workers not supported");
      return;
    }

    const worker = new Worker("/worker.js");
    worker.onmessage = (e) => {
      if (e.data.type === "decision") {
        setDecisionResults(e.data.result);
      }
      worker.terminate();
    };
    worker.onerror = (error) => console.error("Worker error:", error);

    worker.postMessage({
      type: "decision",
      data,
      config: { numericCols, weights },
    });
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
                onChange={(e) =>
                  setWeights({ ...weights, [col]: Number(e.target.value) })
                }
              />
            </Form.Group>
          ))}
          <Button onClick={calculateDecisions} className="mt-2">
            <FontAwesomeIcon icon={faPlay} className="me-1" />
            {t("calculate_decisions")}
          </Button>
        </Form>
        {decisionResults && (
          <Table striped bordered hover size="sm" className="mt-3">
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
        )}
      </Card.Body>
    </Card>
  );
}

export default DecisionMaker;
