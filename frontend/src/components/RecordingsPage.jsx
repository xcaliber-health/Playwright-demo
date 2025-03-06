import { Editor } from "@monaco-editor/react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VNC_Url = import.meta.env.VITE_VNC_URL;
const backendUrl = import.meta.env.VITE_BASE_URL;

const ChatRecordingsPage = () => {
  const [recordings, setRecordings] = useState([]);
  const [agentScripts, setAgentScripts] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [code, setCode] = useState("// Loading...");
  const [parameters, setParameters] = useState({});
  const [parameterValues, setParameterValues] = useState({});
  const [isReplaying, setIsReplaying] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

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

  return (
    <div className="w-full flex flex-col lg:flex-row flex-grow gap-5 p-5 bg-[#0c111d] overflow-hidden text-white">
      {/* Left Sidebar (h-fit, equal spacing) */}
      <div className="w-full lg:w-1/4 p-5 rounded-lg shadow-md bg-[#161b26] border border-[#333741] h-fit">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Task Description</h2>
          <textarea
            className="w-full h-20 bg-[#0c111d] text-white p-2 mt-2 rounded-md border border-[#333741] focus:outline-none"
            placeholder="Describe what you want the agent to do"
            onChange={(e) => setTaskDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold">Additional Information</h2>
          <textarea
            className="w-full h-20 bg-[#0c111d] text-white p-2 mt-2 rounded-lg border border-[#333741] focus:outline-none"
            placeholder="Add any helpful context or instructions..."
            onChange={(e) => setAdditionalInfo(e.target.value)}
          ></textarea>
        </div>

        <button
          className="w-full bg-blue-600 px-4 py-2 rounded-lg border border-[#333741]"
          onClick={handlePromptExecution}
        >
          Run Agent
        </button>
      </div>

      {/* Right Content Section (Takes Full Width) */}
      <div className="flex-grow rounded-lg shadow-md bg-[#161b26] border border-[#333741] p-5 flex flex-col text-white h-full">
        {!selectedRecording ? (
          <div className="flex flex-grow gap-5">
            {/* Recordings List */}
            <div className="w-1/2 bg-[#0c111d] p-5 border border-[#333741] rounded-lg h-full">
              <h3 className="mb-2 text-lg">Recordings</h3>
              <ul className="h-[calc(100%-40px)] overflow-auto">
                {recordings?.length > 0 ? (
                  recordings?.map((rec) => (
                    <li
                      key={rec?.uuid}
                      className="flex justify-between p-2 cursor-pointer hover:bg-[#161b26e7] border border-[#333741] rounded-md"
                      onClick={() => loadRecording(rec?.uuid)}
                    >
                      <span>{rec?.title || rec?.uuid}</span>
                    </li>
                  ))
                ) : (
                  <div className="opacity-75">No recordings available</div>
                )}
              </ul>
            </div>

            {/* Agent Scripts List */}
            <div className="w-1/2 bg-[#0c111d] p-5 border border-[#333741] rounded-lg h-full">
              <h3 className="mb-2 text-lg">Agent Scripts</h3>
              <ul className="h-[calc(100%-40px)] overflow-auto">
                {agentScripts?.length > 0 ? (
                  agentScripts?.map((script) => (
                    <li
                      key={script?.id}
                      className="flex justify-between p-2 border border-[#333741] rounded-md"
                    >
                      <span>{script?.id}</span>
                    </li>
                  ))
                ) : (
                  <div className="opacity-75">No scripts available</div>
                )}
              </ul>
            </div>
          </div>
        ) : !isReplaying ? (
          <div className="flex flex-grow gap-5 text-white">
            {/* Parameters Section */}
            <div className="w-1/3 h-full">
              <h4 className="mb-2">Parameters</h4>
              {Object.entries(parameters).map(([key, param]) => (
                <div key={key} className="mb-4">
                  <label>{param.name}</label>
                  <input
                    type="text"
                    value={parameterValues[key] || ""}
                    onChange={(e) =>
                      setParameterValues({
                        ...parameterValues,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-[#333741] bg-gray-800 text-white rounded"
                  />
                </div>
              ))}
              <button
                onClick={handleReplay}
                className="w-full p-3 bg-blue-500 border border-[#333741] mt-4 rounded"
              >
                Execute Test
              </button>
            </div>

            {/* Code Editor Section (No Overflow, Fits Wrapper) */}
            <div className="w-2/3 border border-[#333741] rounded-lg p-5 h-[75vh] flex flex-col">
              <h4 className="mb-2">Code Editor</h4>
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
          <div className="w-full h-full bg-black border border-[#333741] rounded-lg">
            <iframe
              id="vnc-viewer"
              className="w-full h-full border-none"
              title="VNC Viewer"
              src={`${VNC_Url}/vnc.html?autoconnect=true&resize=remote`}
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRecordingsPage;
