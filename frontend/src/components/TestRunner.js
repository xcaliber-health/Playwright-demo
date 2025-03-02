import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";

const TestRunner = ({ uuid }) => {
  const [code, setCode] = useState("// Loading...");
  const [parameters, setParameters] = useState({});
  const [parameterValues, setParameterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost:3000/file/${uuid}`)
      .then((res) => res.json())
      .then((data) => {
        setCode(data.script);
        setParameters(data.parameters || {});
        setLoading(false);
      });
  }, [uuid]);

  const handleParameterChange = (key, value) => {
    setParameterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    const response = await fetch(`http://localhost:3000/save-file/${uuid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (response.ok) {
      alert("Code saved successfully!");
    } else {
      alert("Failed to save code.");
    }
  };

  const handleReplay = async () => {
    const response = await fetch("http://localhost:3000/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, parameters: parameterValues }),
    });

    if (response.ok) {
      document.getElementById("vnc-viewer").src =
        "http://localhost:8080/vnc.html";
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "25px",
        padding: "20px",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <div
        style={{
          width: "40%",
          background: "#1a1a1a",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          color: "white",
        }}
      >
        <h3
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}
        >
          Parameters
        </h3>

        {Object.entries(parameters).map(([key]) => (
          <div
            key={key}
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "10px",
            }}
          >
            <label
              style={{
                marginBottom: "4px",
                fontSize: "14px",
                color: "#b3b3b3",
              }}
            >
              {key}:
            </label>
            <input
              type="text"
              value={parameterValues[key] || ""}
              onChange={(e) => handleParameterChange(key, e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #444",
                background: "#2a2a2a",
                color: "white",
                outline: "none",
              }}
            />
          </div>
        ))}

        <button
          onClick={handleReplay}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px 20px",
            background: "#007bff",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            transition: "background-color 0.2s ease-in-out",
          }}
          onMouseOver={(e) => (e.target.style.background = "#0056b3")}
          onMouseOut={(e) => (e.target.style.background = "#007bff")}
        >
          Replay Test
        </button>
      </div>

      <div
        ref={containerRef}
        style={{
          width: "55%",
          background: "#1a1a1a",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          color: "white",
        }}
      >
        <h3
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}
        >
          Code Editor
        </h3>

        {loading ? (
          <p style={{ color: "#b3b3b3" }}>Loading code...</p>
        ) : (
          <Editor
            height="400px"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(newCode) => setCode(newCode)}
            onMount={(editor) => (editorRef.current = editor)}
          />
        )}

        <button
          onClick={handleSave}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "10px 20px",
            background: "#007bff",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            transition: "background-color 0.2s ease-in-out",
          }}
          onMouseOver={(e) => (e.target.style.background = "#0056b3")}
          onMouseOut={(e) => (e.target.style.background = "#007bff")}
        >
          Save Code
        </button>
      </div>
    </div>
  );
};

export default TestRunner;
