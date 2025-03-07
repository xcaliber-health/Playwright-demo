import { useState } from "react";
import { Plus, ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { Editor } from "@monaco-editor/react";

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
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  const [recordings, setRecordings] = useState([]);
  const [agentScripts, setAgentScripts] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [code, setCode] = useState("// Loading...");
  const [parameters, setParameters] = useState({});
  const [parameterValues, setParameterValues] = useState({});
  const [isReplaying, setIsReplaying] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const vncUrl = `${VNC_Url}/vnc.html?autoconnect=true&resize=remote`;

  useEffect(() => {
    fetch(`${backendUrl}/scripts`)
      .then((res) => res.json())
      .then((data) => {
        setRecordings(
          data?.scriptDetailList?.filter((script) => script.tag === "script")
        );
        setAgentScripts(
          data?.scriptDetailList?.filter((script) => script.tag === "agent")
        );
      });
  }, []);

  const loadRecording = async (uuid) => {
    setSelectedRecording(uuid);
    toast.info(`Recording with UUID: ${uuid} selected`, {
      position: "top-right",
    });

    const res = await fetch(`${backendUrl}/file/${uuid}`);
    const data = await res.json();
    setCode(data.script);
    setParameters(data.parameters || {});
  };

  const handleReplay = async () => {
    setIsReplaying(true);
    await fetch(`${backendUrl}/replay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: selectedRecording,
        parameters: parameterValues,
      }),
    });
  };

  const handlePromptExecution = async () => {
    const prompt = `Task: ${taskDescription}\nAdditional Info: ${additionalInfo}`;
    await fetch(`${backendUrl}/process-prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid: selectedRecording, prompt }),
    });
  };

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
      setShowLeftPanel(false);
      setShowTestRunner(false);

      const recordingsRes = await fetch(`${backendUrl}/scripts`);
      const recordingsData = await recordingsRes.json();
      setRecordings(
        recordingsData?.scriptDetailList?.filter(
          (script) => script.tag === "script"
        )
      );
      setAgentScripts(
        recordingsData?.scriptDetailList?.filter(
          (script) => script.tag === "agent"
        )
      );
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
    setIsProcessing(false);
  };

  return (
    <div className="w-full flex flex-grow gap-5 p-4 bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar */}
      {showLeftPanel && (
        <div className="w-1/4 p-4 rounded-lg shadow-md bg-[#171717] border border-[#2f2f2f] h-fit transition-all duration-300 relative">
          {/* Close Arrow */}
          <button
            onClick={() => setShowLeftPanel(false)}
            className="absolute -right-4 top-4 bg-[#262626] p-2 rounded-full hover:bg-[#333] border border-[#2f2f2f] transition"
          >
            <ChevronLeft size={20} className="text-[#e5e7eb]" />
          </button>

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
            className="w-full p-3 text-lg border border-[#2f2f2f] bg-[#262626] text-[#e5e7eb] rounded mb-4"
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
            className="w-full p-3 text-lg border border-[#2f2f2f] bg-[#262626] text-[#e5e7eb] rounded mb-4"
          />

          <div className="flex gap-4">
            <button
              onClick={startRecording}
              disabled={isRecording && !isProcessing}
              className={`w-full py-2 text-lg font-semibold text-white rounded transition ${
                isRecording && !isProcessing
                  ? "bg-[#1e3a8a] opacity-50 cursor-not-allowed"
                  : "bg-[#224acc] hover:bg-[#1b3a99]"
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
      )}

      {/* Main Panel */}
      <div
        className={`flex-grow rounded-lg shadow-md bg-[#171717] border border-[#2f2f2f] overflow-auto p-4 transition-all duration-300 ${
          showLeftPanel ? "w-3/4" : "w-full"
        }`}
      >
        {isRecording ? (
          <iframe
            src={vncUrl}
            className="w-full h-full border border-[#2f2f2f] rounded"
            title="Viewer"
          />
        ) : showTestRunner ? (
          <TestRunner uuid={recordingUuid} />
        ) : selectedRecording ? (
          !isReplaying ? (
            <div className="flex flex-grow gap-5 text-white">
              {/* Parameters Section */}
              <div className="w-1/3 h-full bg-[#0d0d0d] p-4 rounded-lg border border-[#2f2f2f]">
                {/* Back Button */}
                <button
                  onClick={() => setSelectedRecording(null)}
                  className="mb-4 flex items-center gap-2 px-3 py-2 bg-[#262626] hover:bg-gray-600 text-white font-semibold rounded-lg border border-[#2f2f2f]"
                >
                  <ChevronLeft size={18} /> Back to Recordings
                </button>

                <h4 className="mb-2 text-lg font-semibold text-[#e5e7eb]">
                  Parameters
                </h4>
                {Object.entries(parameters).length > 0 ? (
                  Object.entries(parameters).map(([key, param]) => (
                    <div key={key} className="mb-4">
                      <label className="block text-sm font-semibold">
                        {param.name}
                      </label>
                      <input
                        type="text"
                        value={parameterValues[key] || ""}
                        onChange={(e) =>
                          setParameterValues({
                            ...parameterValues,
                            [key]: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-[#2f2f2f] bg-[#262626] text-white rounded"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-75">No parameters available</p>
                )}
                <button
                  onClick={handleReplay}
                  className="w-full p-3 bg-blue-500 border border-[#2f2f2f] mt-4 rounded"
                >
                  Execute Test
                </button>
              </div>

              {/* Code Editor Section */}
              <div className="w-2/3 border border-[#2f2f2f] rounded-lg p-5 h-[75vh] flex flex-col">
                <h4 className="mb-2 text-lg font-semibold text-[#e5e7eb]">
                  Code Editor
                </h4>
                <div className="flex-grow overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={setCode}
                    options={{
                      minimap: { enabled: false },
                      scrollbar: { vertical: "hidden" },
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-black border border-[#2f2f2f] rounded-lg">
              <iframe
                id="vnc-viewer"
                className="w-full h-full border-none"
                title="VNC Viewer"
                src={`${VNC_Url}/vnc.html?autoconnect=true&resize=remote`}
              ></iframe>
            </div>
          )
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Recordings Panel */}
            <div className="w-full h-full lg:w-1/2 bg-[#0d0d0d] p-4 rounded-lg border border-[#2f2f2f] flex flex-col">
              <h3 className="text-lg font-semibold text-[#e5e7eb] mb-3">
                Recordings
              </h3>

              {/* List Container */}
              <div className="flex-grow max-h-[70vh] overflow-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 border border-[#2f2f2f] rounded p-2">
                {recordings.length > 0 ? (
                  recordings.map((rec) => (
                    <div
                      key={rec.uuid}
                      onClick={() => loadRecording(rec.uuid)}
                      className="p-3 bg-[#262626] text-[#e5e7eb] rounded cursor-pointer hover:bg-[#333] border border-[#2f2f2f]"
                    >
                      {rec.title || rec.uuid}
                    </div>
                  ))
                ) : (
                  <div className="opacity-75 text-center">
                    No recordings available
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowLeftPanel(true)}
                className="w-full flex items-center justify-center gap-2 p-2 mt-2 text-lg font-semibold text-[#e5e7eb] bg-[#224acc] hover:bg-[#1b3a99] rounded-lg "
              >
                <Plus size={20} /> Add
              </button>
            </div>

            {/* Agent Scripts Panel */}
            <div className="w-full h-full lg:w-1/2 bg-[#0d0d0d] p-4 rounded-lg border border-[#2f2f2f] flex flex-col">
              <h3 className="text-lg font-semibold text-[#e5e7eb] mb-3">
                Agent Scripts
              </h3>

              {/* List Container */}
              <div className="flex-grow max-h-[70vh] overflow-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 border border-[#2f2f2f] rounded p-2">
                {agentScripts.length > 0 ? (
                  agentScripts.map((script) => (
                    <div
                      key={script.id}
                      className="p-3 bg-[#262626] text-[#e5e7eb] rounded cursor-pointer hover:bg-[#333] border border-[#2f2f2f]"
                    >
                      {script.id}
                    </div>
                  ))
                ) : (
                  <div className="opacity-75 text-center">
                    No scripts available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebRecorder;
