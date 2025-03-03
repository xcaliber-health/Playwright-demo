import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";

const TestRunner = ({ uuid }) => {
  const [code, setCode] = useState("// Loading...");
  const [parameters, setParameters] = useState({});
  const [parameterValues, setParameterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
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

  console.log("params", parameters);

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
    setIsReplaying(true);

    const response = await fetch("http://localhost:3000/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid, parameters: parameterValues }),
    });

    if (response.ok) {
      const vncViewer = document.getElementById("vnc-viewer");
      if (vncViewer) {
        vncViewer.src =
          "http://localhost:8080/vnc.html?autoconnect=true&resize=remote";
      }
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      {isReplaying ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "black",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <iframe
            id="vnc-viewer"
            title="VNC Viewer"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
          <button
            onClick={() => setIsReplaying(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "10px 20px",
              background: "#ff4444",
              border: "none",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Close Replay
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "25px",
          }}
        >
          <div
            style={{
              width: "40%",
              background: "#1a1a1a",
              padding: "16px",
              borderRadius: "8px",
              color: "white",
            }}
          >
            <h3>Parameters</h3>
            {Object.entries(parameters).map(([key, param]) => (
              <div key={key} style={{ marginBottom: "10px" }}>
                <label
                  style={{
                    color: "#b3b3b3",
                    fontWeight: "bold",
                    display: "block",
                  }}
                >
                  {param.name}
                </label>
                <small
                  style={{
                    color: "#888",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  {param.description}
                </small>

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
                    width: "96%",
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleReplay}
              style={{
                width: "100%",
                padding: "10px",
                background: "#007bff",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
              }}
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
              color: "white",
            }}
          >
            <h3>Code Editor</h3>
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
              }}
            >
              Save Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner;
