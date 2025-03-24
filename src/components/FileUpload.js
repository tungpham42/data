import React from "react";
import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useLanguage } from "../LanguageContext";

const FileUpload = ({ onDataUpload }) => {
  const { t } = useLanguage();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        complete: (result) => onDataUpload(result),
        header: true,
      });
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        onDataUpload({ data: jsonData });
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith(".json")) {
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          // Ensure the JSON data is an array of objects
          if (
            Array.isArray(jsonData) &&
            jsonData.length > 0 &&
            typeof jsonData[0] === "object"
          ) {
            onDataUpload({ data: jsonData });
          } else {
            throw new Error(t("invalid_data_error"));
          }
        } catch (error) {
          onDataUpload({ error: t("invalid_data_error") });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Form.Group controlId="formFile" className="mb-3">
      <Form.Label>
        <FontAwesomeIcon icon={faUpload} className="me-1" />
        {t("upload_label")}
      </Form.Label>
      <Form.Control
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleFileUpload}
      />
    </Form.Group>
  );
};

export default FileUpload;
