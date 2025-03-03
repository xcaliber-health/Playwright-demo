import { useState } from "react";
import TestRunner from "./RecordingsPage";

const backendUrl = "http://localhost:3000";

function WebRecorder() {
  const [url, setUrl] = useState("https://www.github.com/");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUuid, setRecordingUuid] = useState(null);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const vncUrl =
    "http://localhost:8080/vnc.html?autoconnect=true&resize=remote";

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
      setShowTestRunner(false);
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
      setShowTestRunner(true);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  return (
    <div className="w-full flex h-screen p-5 font-sans gap-5">
      {/* Left Panel */}
      <div className="w-1/2 bg-gray-100 p-5 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Web Recorder</h2>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="w-full p-3 text-lg border border-gray-300 rounded mb-4"
        />
        <div className="flex gap-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`w-full py-3 text-lg font-semibold text-white rounded transition ${
              isRecording
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isRecording ? "Recording..." : "Start Recording"}
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className={`w-full py-3 text-lg font-semibold text-white rounded transition ${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Stop Recording
          </button>
        </div>
      </div>

      <div className="w-1/2 flex-1 bg-white p-5 rounded-lg shadow-md">
        {isRecording ? (
          <>
            <h3 className="text-lg font-semibold mb-4">VNC Browser View</h3>
            <iframe
              src={vncUrl}
              className="w-full h-[85vh] border border-gray-300 rounded"
              title="VNC Viewer"
            />
          </>
        ) : showTestRunner ? (
          <TestRunner uuid={recordingUuid} />
        ) : (
          <p className="text-gray-500 text-center text-lg">
            Start recording to see the VNC browser.
          </p>
        )}
      </div>
    </div>
  );
}

export default WebRecorder;
