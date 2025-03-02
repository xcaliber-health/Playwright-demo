import { useState, useEffect } from "react";
import axios from "axios";

const backendUrl = "http://localhost:3000";

function WebReplay({ uuid }) {
  const [parameters, setParameters] = useState({});
  const [rawParams, setRawParams] = useState("{}");
  const [iframeUrl, setIframeUrl] = useState("");
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await axios.get(`${backendUrl}/file/${uuid}`);
        const params = response.data.parameters || {};
        setParameters(params);
        setRawParams(JSON.stringify(params, null, 2));
      } catch (error) {
        console.error("Error fetching parameters:", error);
      }
    };

    fetchParameters();
  }, [uuid]);

  const handleInputChange = (key, value) => {
    const updatedParams = { ...parameters, [key]: value };
    setParameters(updatedParams);
    setRawParams(JSON.stringify(updatedParams, null, 2));
  };

  const handleRawChange = (e) => {
    setRawParams(e.target.value);
    try {
      const parsedParams = JSON.parse(e.target.value);
      setParameters(parsedParams);
      setIsJsonValid(true);
    } catch (error) {
      setIsJsonValid(false);
    }
  };

  // Send replay request
  const handleReplay = async () => {
    if (!isJsonValid) {
      alert("Invalid JSON format! Please correct it before replaying.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/replay`, {
        uuid,
        parameters,
      });

      if (response.data.replayUrl) {
        setIframeUrl(response.data.replayUrl);
      } else {
        alert("Replay completed, but no replay URL provided.");
      }
    } catch (error) {
      alert("Failed to start replay. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "50%",
          padding: "16px",
          textAlign: "center",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2 style={{ color: "#333" }}>🎬 Web Replay Controls</h2>
        <p>Enter the parameters below to replay the recorded session.</p>

        {Object.keys(parameters).length > 0 ? (
          <form>
            {Object.entries(parameters).map(([key, value]) => (
              <div
                key={key}
                style={{ marginBottom: "10px", textAlign: "left" }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    color: "#555",
                  }}
                >
                  {key}{" "}
                  <span style={{ color: "gray", fontSize: "12px" }}>
                    (Enter {typeof value})
                  </span>
                </label>
                <input
                  type={typeof value === "number" ? "number" : "text"}
                  value={
                    typeof value === "object" ? JSON.stringify(value) : value
                  }
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder={`Enter ${key}`}
                  style={{
                    padding: "8px",
                    width: "100%",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                  }}
                />
              </div>
            ))}
          </form>
        ) : (
          <p>No parameters found.</p>
        )}

        <h3 style={{ marginTop: "20px", textAlign: "left" }}>
          🔧 Raw JSON Parameters
        </h3>
        <textarea
          value={rawParams}
          onChange={handleRawChange}
          rows={5}
          style={{
            width: "100%",
            padding: "8px",
            fontFamily: "monospace",
            border: isJsonValid ? "1px solid #ccc" : "1px solid red",
            borderRadius: "5px",
          }}
        ></textarea>

        {!isJsonValid && (
          <p style={{ color: "red" }}>❌ Invalid JSON format!</p>
        )}

        <button
          onClick={handleReplay}
          disabled={!isJsonValid || loading}
          style={{
            padding: "10px 20px",
            backgroundColor: isJsonValid ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isJsonValid ? "pointer" : "not-allowed",
            marginTop: "10px",
          }}
        >
          {loading ? "⏳ Replaying..." : "▶️ Start Replay"}
        </button>

        {iframeUrl && (
          <div style={{ marginTop: "20px" }}>
            <h3>Replay Output</h3>
            <iframe
              src={iframeUrl}
              width="100%"
              height="500px"
              style={{ border: "1px solid #ccc" }}
              title="Replay View"
            ></iframe>
          </div>
        )}
      </div>

      <div style={{ width: "50%", padding: "16px", textAlign: "center" }}>
        <h2>📝 Code Editor</h2>
        <p>This section can be used to edit or view logs.</p>
      </div>
    </div>
  );
}

export default WebReplay;
