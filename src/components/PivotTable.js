import React, { useState, useEffect } from "react";
import { Card, Form, Table, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
  faArrowUp,
  faArrowDown,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

function PivotTable({ data, columns }) {
  const [rowField, setRowField] = useState(columns[0]);
  const [colField, setColField] = useState(columns[1]);
  const [valueField, setValueField] = useState(
    columns.find((col) => data.every((item) => !isNaN(Number(item[col]))))
  );
  const [pivotResult, setPivotResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof Worker === "undefined") {
      console.warn("Web Workers not supported, falling back to main thread");
      const result = {};
      const rowValues = [...new Set(data.map((item) => item[rowField]))];
      const colValues = [...new Set(data.map((item) => item[colField]))];

      // Aggregate data by rowField and colField, summing valueField
      data.forEach((item) => {
        const rowKey = item[rowField];
        const colKey = item[colField];
        if (!result[rowKey]) result[rowKey] = {};
        result[rowKey][colKey] =
          (result[rowKey][colKey] || 0) + Number(item[valueField] || 0);
      });

      setPivotResult({ result, rowValues, colValues });
      return;
    }

    const worker = new Worker("/worker.js");
    worker.onmessage = (e) => {
      if (e.data.type === "pivot") {
        setPivotResult(e.data.result);
      }
    };
    worker.onerror = (error) => console.error("Worker error:", error);

    worker.postMessage({
      type: "pivot",
      data,
      config: { rowField, colField, valueField },
    });

    return () => worker.terminate();
  }, [data, rowField, colField, valueField]);

  if (!pivotResult) return <div>Loading...</div>;

  const { result, rowValues, colValues } = pivotResult;

  const totalPages = Math.ceil(rowValues.length / rowsPerPage);
  const paginatedRows = rowValues.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          <FontAwesomeIcon icon={faTable} className="me-2" />
          {t("pivot_table_title")}
        </Card.Title>
        <Form className="mb-3">
          <Form.Group>
            <Form.Label>
              <FontAwesomeIcon icon={faArrowDown} className="me-1" />
              {t("rows")}
            </Form.Label>
            <Form.Select onChange={(e) => setRowField(e.target.value)}>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              <FontAwesomeIcon icon={faArrowUp} className="me-1" />
              {t("columns")}
            </Form.Label>
            <Form.Select onChange={(e) => setColField(e.target.value)}>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              <FontAwesomeIcon icon={faLayerGroup} className="me-1" />
              {t("values")}
            </Form.Label>
            <Form.Select onChange={(e) => setValueField(e.target.value)}>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>{t("rows_per_page")}</Form.Label>
            <Form.Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "auto", display: "inline-block" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </Form.Group>
        </Form>
        <div className="table-responsive">
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>{rowField}</th>
                {colValues.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => (
                <tr key={row}>
                  <td>{row}</td>
                  {colValues.map((col) => (
                    <td key={col}>{(result[row]?.[col] || 0).toFixed(2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              {t("showing_entries", {
                start: (currentPage - 1) * rowsPerPage + 1,
                end: Math.min(currentPage * rowsPerPage, rowValues.length),
                total: rowValues.length,
              })}
            </div>
            <Pagination>
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faArrowUp} />
              </Pagination.First>
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FontAwesomeIcon icon={faArrowDown} />
              </Pagination.Prev>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FontAwesomeIcon icon={faArrowDown} />
              </Pagination.Next>
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <FontAwesomeIcon icon={faArrowUp} />
              </Pagination.Last>
            </Pagination>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default PivotTable;
