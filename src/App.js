import React, { useState } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons"; // Icon for "Data Analysis Tool"
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import ChartBuilder from "./components/ChartBuilder";
import StatisticsPanel from "./components/StatisticsPanel";
import PivotTable from "./components/PivotTable";
import DecisionMaker from "./components/DecisionMaker";

function App() {
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);

  const validateData = (parsedData) => {
    if (!parsedData?.data?.length) {
      throw new Error("No data found in the uploaded file");
    }
    if (!Object.keys(parsedData.data[0]).length) {
      throw new Error("Invalid data format");
    }
    return true;
  };

  const handleDataUpload = (parsedData) => {
    try {
      setError(null);
      validateData(parsedData);
      setData(parsedData.data);
      setColumns(Object.keys(parsedData.data[0]));
    } catch (err) {
      setError(err.message);
      setData(null);
      setColumns([]);
    }
  };

  return (
    <Container fluid className="p-4">
      <h1>
        <FontAwesomeIcon icon={faChartLine} className="me-2" />
        Data Analysis Tool
      </h1>
      <Row>
        <Col md={12}>
          <FileUpload onDataUpload={handleDataUpload} />
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>
      {data && (
        <Row className="mt-4">
          <Col md={6}>
            <DataTable data={data} columns={columns} />
            <StatisticsPanel data={data} columns={columns} />
          </Col>
          <Col md={6}>
            <ChartBuilder data={data} columns={columns} />
            <PivotTable data={data} columns={columns} />
            <DecisionMaker data={data} columns={columns} />
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default App;
