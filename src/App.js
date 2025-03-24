import React, { useState, useMemo } from "react";
import { Container, Row, Col, Alert, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import ChartBuilder from "./components/ChartBuilder";
import StatisticsPanel from "./components/StatisticsPanel";
import PivotTable from "./components/PivotTable";
import DecisionMaker from "./components/DecisionMaker";
import DataCleaner from "./components/DataCleaner"; // Import the new component
import { LanguageProvider, useLanguage } from "./LanguageContext";
import Footer from "./components/Footer";

const AppContent = React.memo(() => {
  const [rawData, setRawData] = useState(null); // Store raw uploaded data
  const [data, setData] = useState(null); // Store cleaned data
  const [error, setError] = useState(null);
  const { t, language, setLanguage } = useLanguage();

  const columns = useMemo(() => (data ? Object.keys(data[0]) : []), [data]);

  const validateData = (parsedData) => {
    if (parsedData?.error) throw new Error(parsedData.error);
    if (!parsedData?.data?.length) throw new Error(t("no_data_error"));
    if (
      !Array.isArray(parsedData.data) ||
      !parsedData.data[0] ||
      typeof parsedData.data[0] !== "object"
    ) {
      throw new Error(t("invalid_data_error"));
    }
    if (!Object.keys(parsedData.data[0]).length)
      throw new Error(t("invalid_data_error"));
    return true;
  };

  const handleDataUpload = (parsedData) => {
    try {
      setError(null);
      validateData(parsedData);
      setRawData(parsedData.data); // Store raw data
      setData(null); // Reset cleaned data until cleaning is applied
    } catch (err) {
      setError(err.message);
      setRawData(null);
      setData(null);
    }
  };

  const handleDataCleaned = (cleanedData) => {
    setData(cleanedData); // Update the cleaned data state
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>
          <FontAwesomeIcon icon={faChartLine} className="me-2" />
          {t("app_title")}
        </h1>
        <Form.Group>
          <Form.Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </Form.Select>
        </Form.Group>
      </div>
      <Row>
        <Col md={12}>
          <FileUpload onDataUpload={handleDataUpload} />
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
      </Row>
      {rawData && (
        <Row className="mt-4">
          <Col md={6}>
            <DataCleaner
              rawData={rawData}
              columns={Object.keys(rawData[0])}
              onDataCleaned={handleDataCleaned}
            />
            {data && (
              <>
                <DataTable data={data} columns={columns} />
                <StatisticsPanel data={data} columns={columns} />
                <DecisionMaker data={data} columns={columns} />
              </>
            )}
          </Col>
          {data && (
            <Col md={6}>
              <ChartBuilder data={data} columns={columns} />
              <PivotTable data={data} columns={columns} />
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
});

const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
      <Footer />
    </LanguageProvider>
  );
};

export default App;
