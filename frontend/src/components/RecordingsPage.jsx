import { Editor } from "@monaco-editor/react";
import { Play } from "lucide-react";
import React, { useEffect, useState } from "react";

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
    alert(`Recording with uuid:${uuid} selected`);
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
      body: JSON.stringify({
        uuid: selectedRecording,
        prompt: prompt,
      }),
    });
  };

  return (
    <div className="flex h-screen w-full p-4 bg-[#0c111d] text-white">
      {/* Left Sidebar */}
      <div className="w-1/3 flex flex-col bg-[#161b26] border border-[#333741] rounded-lg self-start py-2 mr-4">
        <div className="p-4  rounded-lg mb-4">
          <h2 className="text-lg font-semibold">Task Description</h2>
          <textarea
            className="w-full bg-[#0c111d] text-white p-2 pb-10 mt-2 rounded-md border border-[#333741] focus:outline-none"
            placeholder="Describe what you want the agent to do"
            onChange={(e) => setTaskDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold">Additional Information</h2>
          <textarea
            className="w-full bg-[#0c111d] text-white p-2 pb-4 mt-2 rounded-lg border border-[#333741] focus:outline-none"
            placeholder="Add any helpful context or instructions..."
            onChange={(e) => setAdditionalInfo(e.target.value)}
          ></textarea>
        </div>

        <div className="flex px-4 mb-2">
          <button
            className="w-full bg-blue-600 px-4 py-2 rounded-lg border border-[#333741]"
            onClick={handlePromptExecution}
          >
            Run Agent
          </button>
        </div>
      </div>

      {/* Right Content Section */}
      <div className="w-2/3 bg-[#161b26] border border-[#333741] p-4 rounded-lg shadow-lg">
        {!selectedRecording ? (
          <div className="flex gap-4">
            {/* Recordings List */}
            <div className="w-1/2 bg-[#0c111d] p-4 border border-[#333741] rounded-md">
              <h3 className="mb-2 text-lg">Recordings</h3>
              <ul>
                {recordings?.length > 0 ? (
                  recordings?.map((rec) => (
                    <li
                      key={rec?.uuid}
                      className="flex justify-between p-2 cursor-pointer hover:bg-[#161b26e7] border border-[#333741] rounded-md"
                      onClick={() => loadRecording(rec?.uuid)}
                    >
                      <span>{rec?.uuid}</span>
                    </li>
                  ))
                ) : (
                  <div className="opacity-75">No recordings available</div>
                )}
              </ul>
            </div>

            {/* Agent Scripts List */}
            <div className="w-1/2 bg-[#0c111d] p-4 border border-[#333741] rounded-md">
              <h3 className="mb-2 text-lg">Agent Scripts</h3>
              <ul>
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
          <div className="flex gap-6">
            {/* Parameters Section */}
            <div className="w-1/3">
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

            {/* Code Editor Section */}
            <div className="w-2/3 border border-[#333741] rounded-lg p-4">
              <h4 className="mb-2">Code Editor</h4>
              <Editor
                height="350px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={setCode}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 w-full h-full bg-black border border-[#333741] rounded-lg">
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
