import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { Play } from "lucide-react";

const VNC_Url = import.meta.env.VITE_VNC_URL;
const backendUrl = import.meta.env.VITE_BASE_URL;

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState();
  const [agentScripts, setAgentScripts] = useState();
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [code, setCode] = useState("// Loading...");
  const [parameters, setParameters] = useState({});
  const [parameterValues, setParameterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    fetch(`${backendUrl}/scripts`)
      .then((res) => res.json())
      .then((data) => {
        const filteredRecordings = data?.scriptDetailList.filter(
          (script) => script.tag === "script"
        );
        setRecordings(filteredRecordings);

        const filteredScripts = data?.scriptDetailList.filter(
          (script) => script.tag === "agent"
        );

        setAgentScripts(filteredScripts);
      });
  }, [recordings, agentScripts]);

  const loadRecording = async (uuid) => {
    setSelectedRecording(uuid);
    setLoading(true);

    const res = await fetch(`${backendUrl}/file/${uuid}`);
    const data = await res.json();
    setCode(data.script);
    setParameters(data.parameters || {});
    setLoading(false);
  };

  const handleReplay = async () => {
    setIsReplaying(true);

    const response = await fetch(`${backendUrl}/replay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: selectedRecording,
        parameters: parameterValues,
      }),
    });

    if (response.ok) {
      document.getElementById(
        "vnc-viewer"
      ).src = `${VNC_Url}/vnc.html?autoconnect=true&resize=remote`;
    }
  };

  return (
    <div className="w-full h-screen flex gap-6 p-5">
      <div className="w-full flex flex-col gap-4">
        <div className="w-1/3 bg-gray-900 p-4 rounded-md text-white self-start">
          <h3>Recordings</h3>
          <ul>
            {recordings?.map((rec) => (
              <li
                key={rec?.uuid}
                className="flex justify-between items-center text-white bg-gray-900 border-b border-gray-700 p-2 m-2"
              >
                <span>{rec?.uuid}</span>
                <button onClick={() => loadRecording(rec?.uuid)}>
                  <Play
                    size={20}
                    className="text-blue-500 hover:text-blue-300"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/3 bg-gray-900 p-4 rounded-md text-white self-start">
          <h3>Agent Scripts</h3>
          <ul>
            {agentScripts?.map((script) => (
              <li
                key={script?.id}
                className="flex justify-between items-center text-white bg-gray-900 border-b border-gray-700 p-2 m-2"
              >
                <span>{script?.id}</span>
                <button
                // onClick={() =>
                //   loadRecording("5c5787bd-c96e-4224-9e30-69ad30706153")
                // }
                >
                  <Play
                    size={20}
                    className="text-blue-500 hover:text-blue-300"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {selectedRecording && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-lg z-50 p-6">
          <div className="bg-gray-900/90 p-8 rounded-xl w-[1000px] text-white relative shadow-2xl">
            <button
              className="absolute top-3 right-3 text-white text-2xl"
              onClick={() => setSelectedRecording(null)}
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Test Execution</h3>

            <div className="flex gap-6">
              <div className="w-1/3">
                <h4 className="text-lg font-semibold mb-2">Parameters</h4>
                {Object.entries(parameters).map(([key, param]) => (
                  <div key={key} className="mb-4">
                    <label className="text-gray-300 font-bold">
                      {param.name}
                    </label>
                    <small className="block text-gray-500 mb-1">
                      {param.description}
                    </small>
                    <input
                      type="text"
                      value={parameterValues[key] || ""}
                      onChange={(e) =>
                        setParameterValues({
                          ...parameterValues,
                          [key]: e.target.value,
                        })
                      }
                      className="p-2 rounded border border-gray-700 bg-gray-800 text-white w-full"
                    />
                  </div>
                ))}
                <button
                  onClick={handleReplay}
                  className="w-full p-3 bg-blue-500 hover:bg-blue-600 rounded-md text-white cursor-pointer mt-4"
                >
                  Execute Test
                </button>
              </div>

              <div className="w-2/3 rounded-md overflow-hidden">
                <h4 className="text-lg font-semibold mb-2">Code Editor</h4>
                {loading ? (
                  <p className="text-gray-400">Loading code...</p>
                ) : (
                  <Editor
                    height="350px"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(newCode) => setCode(newCode)}
                    onMount={(editor) => (editorRef.current = editor)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isReplaying && (
        <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
          <iframe
            id="vnc-viewer"
            className="w-full h-full border-none"
            title="VNC Viewer"
          ></iframe>
          <button
            onClick={() => setIsReplaying(false)}
            className="absolute top-2 right-2 px-4 py-2 bg-red-500 rounded-md text-white cursor-pointer"
          >
            Close Replay
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordingsPage;
