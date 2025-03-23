import React, { useState, useEffect } from "react";
import { Card, Table, Form, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faArrowUp,
  faArrowDown,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

function DataTable({ data, columns }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [processedData, setProcessedData] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof Worker === "undefined") {
      console.warn("Web Workers not supported");
      setProcessedData(data);
      return;
    }

    const worker = new Worker("/worker.js");
    worker.onmessage = (e) => {
      if (e.data.type === "sortFilter") {
        setProcessedData(e.data.result);
      }
    };
    worker.onerror = (error) => console.error("Worker error:", error);

    worker.postMessage({
      type: "sortFilter",
      data,
      config: { filter, sortConfig, columns },
    });

    return () => worker.terminate();
  }, [data, sortConfig, filter, columns]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const requestSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          <FontAwesomeIcon icon={faTable} className="me-2" />
          {t("data_table_title")}
        </Card.Title>
        <div className="d-flex justify-content-between mb-3">
          <Form.Group className="w-50">
            <Form.Control
              type="text"
              placeholder={t("filter_placeholder")}
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="me-2">{t("rows_per_page")}</Form.Label>
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
        </div>
        <div className="table-responsive">
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => requestSort(col)}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    {col}
                    {sortConfig.key === col ? (
                      sortConfig.direction === "asc" ? (
                        <FontAwesomeIcon icon={faArrowUp} className="ms-1" />
                      ) : (
                        <FontAwesomeIcon icon={faArrowDown} className="ms-1" />
                      )
                    ) : (
                      <FontAwesomeIcon icon={faSort} className="ms-1" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col) => (
                    <td key={col}>{row[col]}</td>
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
                end: Math.min(currentPage * rowsPerPage, processedData.length),
                total: processedData.length,
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

export default DataTable;
