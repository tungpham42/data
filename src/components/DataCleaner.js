import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBroom, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

function DataCleaner({ rawData, columns, onDataCleaned }) {
  const [cleanOptions, setCleanOptions] = useState({
    removeDuplicates: false,
    fillMissing: "leave", // Default to "leave" for consistency
    trimStrings: false,
    normalizeNumbers: false,
  });
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  const handleOptionChange = (option, value) => {
    setCleanOptions((prev) => ({ ...prev, [option]: value }));
  };

  const cleanData = () => {
    try {
      setError(null);
      let cleanedData = [...rawData];

      // Remove duplicates based on all columns
      if (cleanOptions.removeDuplicates) {
        cleanedData = Array.from(
          new Map(
            cleanedData.map((item) => [JSON.stringify(item), item])
          ).values()
        );
      }

      // Process each row
      cleanedData = cleanedData.map((row) => {
        const newRow = { ...row };

        columns.forEach((col) => {
          let value = newRow[col];

          // Trim strings
          if (
            cleanOptions.trimStrings &&
            typeof value === "string" &&
            value !== null &&
            value !== undefined
          ) {
            newRow[col] = value.trim();
          }

          // Fill missing values
          if (
            (value === null || value === undefined || value === "") &&
            cleanOptions.fillMissing !== "leave"
          ) {
            newRow[col] =
              cleanOptions.fillMissing === "0" ? 0 : cleanOptions.fillMissing;
          }

          // Normalize numbers (convert to number if possible)
          if (
            cleanOptions.normalizeNumbers &&
            value !== null &&
            value !== undefined &&
            !isNaN(Number(value))
          ) {
            newRow[col] = Number(value);
          }
        });

        return newRow;
      });

      onDataCleaned(cleanedData);
    } catch (err) {
      setError(t("error_cleaning_data", { message: err.message }));
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          <FontAwesomeIcon icon={faBroom} className="me-2" />
          {t("data_cleaner_title")}
        </Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label={t("remove_duplicates_label")}
              checked={cleanOptions.removeDuplicates}
              onChange={(e) =>
                handleOptionChange("removeDuplicates", e.target.checked)
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t("fill_missing_label")}</Form.Label>
            <Form.Select
              value={cleanOptions.fillMissing}
              onChange={(e) =>
                handleOptionChange("fillMissing", e.target.value)
              }
            >
              <option value="leave">{t("fill_missing_leave")}</option>
              <option value="0">{t("fill_missing_zero")}</option>
              <option value="N/A">{t("fill_missing_na")}</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label={t("trim_strings_label")}
              checked={cleanOptions.trimStrings}
              onChange={(e) =>
                handleOptionChange("trimStrings", e.target.checked)
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label={t("normalize_numbers_label")}
              checked={cleanOptions.normalizeNumbers}
              onChange={(e) =>
                handleOptionChange("normalizeNumbers", e.target.checked)
              }
            />
          </Form.Group>
          <Button onClick={cleanData} variant="primary">
            <FontAwesomeIcon icon={faCheck} className="me-1" />
            {t("clean_data_button")}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default DataCleaner;
