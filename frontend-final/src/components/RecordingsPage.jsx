import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { Play } from "lucide-react";

const mockRecordings = [
  { id: "rec1", name: "Recording 1" },
  { id: "rec2", name: "Recording 2" },
  { id: "rec3", name: "Recording 3" },
];

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState(mockRecordings);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [code, setCode] = useState("// Loading...");
  const [parameters, setParameters] = useState({});
  const [parameterValues, setParameterValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
  const editorRef = useRef(null);

  // useEffect(() => {
  //   fetch(`http://localhost:3000/files`)
  //     .then((res) => res.json())
  //     .then((data) => setRecordings(data));
  // }, []);

  const loadRecording = async (fileUuid) => {
    setSelectedRecording(fileUuid);
    setLoading(true);

    const res = await fetch(`http://localhost:3000/file/${fileUuid}`);
    const data = await res.json();
    setCode(data.script);
    setParameters(data.parameters || {});
    setLoading(false);
  };

  const handleReplay = async () => {
    setIsReplaying(true);

    const response = await fetch("http://localhost:3000/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: selectedRecording,
        parameters: parameterValues,
      }),
    });

    if (response.ok) {
      document.getElementById("vnc-viewer").src =
        "http://localhost:8080/vnc.html?autoconnect=true&resize=remote";
    }
  };

  return (
    <div className="p-5 max-w-[1200px] mx-auto flex gap-6">
      {/* Recordings List */}
      <div className="w-1/3 bg-gray-900 p-4 rounded-md text-white">
        <h3>Recordings</h3>
        <ul>
          {recordings.map((rec) => (
            <li
              key={rec.uuid}
              className="flex justify-between items-center border-b border-gray-700 py-2"
            >
              <span>{rec.name}</span>
              <button onClick={() => loadRecording(rec.uuid)}>
                <Play size={20} className="text-blue-500 hover:text-blue-300" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedRecording && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-6">
          <div className="bg-gray-900 p-6 rounded-lg w-[800px] text-white relative">
            <button
              className="absolute top-2 right-2 text-red-500"
              onClick={() => setSelectedRecording(null)}
            >
              ✕
            </button>
            <h3>Test Execution</h3>
            <div className="flex gap-4">
              <div className="w-1/3">
                <h4>Parameters</h4>
                {Object.entries(parameters).map(([key, param]) => (
                  <div key={key} className="mb-2">
                    <label className="text-gray-400 font-bold">
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
                  className="w-full p-2 bg-blue-500 rounded-md text-white cursor-pointer mt-2"
                >
                  Execute Test
                </button>
              </div>

              <div className="w-2/3">
                <h4>Code Editor</h4>
                {loading ? (
                  <p className="text-gray-400">Loading code...</p>
                ) : (
                  <Editor
                    height="300px"
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
