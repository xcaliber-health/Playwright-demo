import { useState } from "react";
import { StopCircle } from "lucide-react";
import TestRunner from "./RecordingsPage";

const VNC_Url = import.meta.env.VITE_VNC_URL;
const backendUrl = import.meta.env.VITE_BASE_URL;

function WebRecorder({ setActiveTab }) {
  const [url, setUrl] = useState("");
  const [operation, setOperation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUuid, setRecordingUuid] = useState(null);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const vncUrl = `${VNC_Url}/vnc.html?autoconnect=true&resize=remote`;

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
    setIsProcessing(true);
    try {
      const response = await fetch(`${backendUrl}/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid: recordingUuid, title: operation }),
      });
      const data = await response.json();
      alert(data.message);
      setIsRecording(false);
      setShowTestRunner(true);
      setActiveTab("Replays");
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
    setIsProcessing(false);
  };
  console.log(
    "first",
    JSON.stringify({ uuid: recordingUuid, title: operation })
  );
  return (
    <div className="w-full flex h-screen p-5 font-sans gap-5 bg-[#0c111d]">
      {/* Sidebar */}
      <div
        className={`${
          isRecording && !isProcessing ? "w-16" : "w-1/4"
        } p-5 rounded-lg shadow-md transition-all duration-300 bg-[#161b26] border border-[#333741]`}
      >
        {!isRecording || isProcessing ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#e5e7eb]">
              Web Recorder
            </h2>

            {/* Operation Name */}
            <label className="block text-[#e5e7eb] font-semibold mb-2">
              Operation Name
            </label>
            <input
              type="text"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              placeholder="Enter operation name"
              className="w-full p-3 text-lg border border-[#333741] bg-[#0c111d] text-[#e5e7eb] rounded mb-4"
            />

            {/* Target URL */}
            <label className="block text-[#e5e7eb] font-semibold mb-2">
              Target URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL"
              className="w-full p-3 text-lg border border-[#333741] bg-[#0c111d] text-[#e5e7eb] rounded mb-4"
            />

            <div className="flex gap-4">
              <button
                onClick={startRecording}
                disabled={isRecording && !isProcessing}
                className={`w-full py-2 text-lg font-semibold text-white rounded transition ${
                  isRecording && !isProcessing
                    ? "bg-[#1e3a8a] opacity-50 cursor-not-allowed"
                    : "bg-[#2563eb] hover:bg-[#1e40af]"
                }`}
              >
                {isRecording ? "Recording..." : "Start"}
              </button>
              <button
                onClick={stopRecording}
                disabled={!isRecording}
                className={`w-full py-2 text-lg font-semibold text-white rounded transition ${
                  isRecording
                    ? "bg-[#3b82f6] hover:bg-[#2563eb]"
                    : "bg-[#1e3a8a] opacity-50 cursor-not-allowed"
                }`}
              >
                Stop
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4 relative">
            <button
              onClick={stopRecording}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white p-3 rounded-full relative"
            >
              <StopCircle size={24} />
            </button>
            {showTooltip && (
              <div className="absolute top-10 bg-black text-white text-xs rounded px-2 py-1">
                Stop
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Panel */}
      <div
        className={`${
          isRecording ? "w-full" : "w-3/4"
        } flex-1 p-5 rounded-lg shadow-md transition-all duration-300 bg-[#161b26] border border-[#333741]`}
      >
        {isRecording ? (
          <>
            <h3 className="text-lg font-semibold mb-4 text-[#e5e7eb]">
              VNC Browser View
            </h3>
            <iframe
              src={vncUrl}
              className="w-full h-[85vh] border border-[#333741] rounded"
              title="VNC Viewer"
            />
          </>
        ) : showTestRunner ? (
          <TestRunner uuid={recordingUuid} />
        ) : (
          <p className="text-[#9ca3af] text-center text-lg">
            Start recording to view the browser.
          </p>
        )}
      </div>
    </div>
  );
}

export default WebRecorder;
