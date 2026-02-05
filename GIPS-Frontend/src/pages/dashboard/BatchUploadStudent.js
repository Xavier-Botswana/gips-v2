import React, { useState } from "react";
import Papa from "papaparse";

const CSVReader = () => {
  const [csvData, setCsvData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const csvContent = e.target.result;

        Papa.parse(csvContent, {
          header: true, // Use the first row as headers for the object keys
          skipEmptyLines: true, // Skip empty lines
          complete: (results) => {
            setCsvData(results.data); // Store parsed CSV data in the state
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
          }
        });
      };

      reader.onerror = () => {
        console.error("Error reading the file");
      };

      reader.readAsText(file);
    }
  };

  return (
    <div>
      <h2>Upload and Parse CSV File</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <h3>Parsed Data:</h3>
      <pre>{JSON.stringify(csvData, null, 2)}</pre>
    </div>
  );
};

export default CSVReader;
