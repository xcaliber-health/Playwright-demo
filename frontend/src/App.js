import { useState } from "react";
import CodeEditor from "./codeEditor";

const backendUrl = "http://localhost:7000";
function WebRecorder() {
  const [url, setUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState(null);
  const [recordingUuid, setRecordingUuid] = useState(null);
  const vncUrl = "http://localhost:9000/vnc.html?autoconnect=true&resize=remote";

  const startRecording = async () => {
    if (!url.trim()) {
      alert("Please enter a valid URL");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUrl: url }),
      });
      const data = await response.json();
      alert(data.message);
      setIsRecording(true);
      setRecordedFile(null);
      setRecordingUuid(data.uuid);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      const response = await fetch(`${backendUrl}/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid: recordingUuid }),
      });
      const data = await response.json();
      alert(data.message);
      setIsRecording(false);

      if (data.file) {
        setRecordedFile(data.file);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial" }}>
      <h2>Web Recorder</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL"
        style={{
          padding: "10px",
          width: "60%",
          fontSize: "16px",
          marginBottom: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
      <div>
        <button
          onClick={startRecording}
          disabled={isRecording}
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "16px",
            backgroundColor: isRecording ? "#ccc" : "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: isRecording ? "not-allowed" : "pointer",
          }}
        >
          {isRecording ? "Recording..." : "Start Recording"}
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: isRecording ? "#dc3545" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: !isRecording ? "not-allowed" : "pointer",
          }}
        >
          Stop Recording
        </button>
      </div>

      {isRecording ? (
        <>
          <h3>VNC Browser View</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <iframe
              src={vncUrl}
              width="100%"
              height="900px"
              style={{
                display: "block",
                border: "1px solid #ccc",
                borderRadius: "5px",
                overflow: "hidden",
                objectFit: "cover", // Ensures content fills iframe properly
                transformOrigin: "top left",
              }}
              title="VNC Viewer"
            />
          </div>
        </>
      ) : recordedFile ? (
        <CodeEditor
          uuid={recordedFile.split("/").pop().replace(".spec.ts", "")}
        />
      ) : null}
    </div>
  );
}

export default WebRecorder;