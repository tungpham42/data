import React from "react";
import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useLanguage } from "../LanguageContext";

function FileUpload({ onDataUpload }) {
  const { t } = useLanguage();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        complete: (result) => onDataUpload(result),
        header: true,
      });
    } else if (file.name.endsWith(".xlsx")) {
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        onDataUpload({ data: jsonData });
      };
      reader.readAsArrayBuffer(file);
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
        accept=".csv,.xlsx"
        onChange={handleFileUpload}
      />
    </Form.Group>
  );
}

export default FileUpload;
