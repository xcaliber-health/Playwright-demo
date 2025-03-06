import { useState } from "react";
import { StopCircle } from "lucide-react";
import TestRunner from "./RecordingsPage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      toast.error("Please enter a valid URL", { position: "top-right" });
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

      toast.info(data.message, { position: "top-right" });

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

      toast.info(data.message, { position: "top-right" });

      setIsRecording(false);
      setShowTestRunner(true);
      setActiveTab("Replays");
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
    setIsProcessing(false);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row flex-grow gap-5 p-5 bg-[#0c111d] overflow-hidden">
      {/* Sidebar (Fixed width, no collapsing) */}
      <div className="w-full lg:w-1/4 p-5 rounded-lg shadow-md bg-[#161b26] border border-[#333741]">
        <h2 className="text-xl font-bold mb-4 text-[#e5e7eb]">Web Recorder</h2>

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
      </div>

      {/* Main Panel */}
      <div className="flex-grow rounded-lg shadow-md bg-[#161b26] border border-[#333741] overflow-auto p-4">
        {isRecording ? (
          <iframe
            src={vncUrl}
            className="w-full h-full border border-[#333741] rounded"
            title="Viewer"
          />
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
