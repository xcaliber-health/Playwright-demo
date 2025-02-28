import React, { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ uuid }) => {
  const [code, setCode] = useState("// Loading...");
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/file/${uuid}`);
      setCode(response.data);
    } catch (error) {
      console.error("Error fetching code:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCode = async () => {
    try {
      await axios.post(`http://localhost:3000/save-file/${uuid}`, { code });
      alert("Code saved successfully!");
    } catch (error) {
      console.error("Error saving code:", error);
    }
  };

  useEffect(() => {
    fetchCode();
  }, [uuid]);

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "16px",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        color: "white",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        Embedded Code Editor
      </h2>

      {loading ? (
        <p style={{ color: "#b3b3b3" }}>Loading code...</p>
      ) : (
        <Editor
          height="400px"
          defaultLanguage="typescript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      )}

      <button
        onClick={saveCode}
        style={{
          marginTop: "16px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          border: "none",
          borderRadius: "6px",
          color: "white",
          cursor: "pointer",
          fontSize: "14px",
          transition: "background-color 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
      >
        Save Code
      </button>
    </div>
  );
};

export default CodeEditor;
