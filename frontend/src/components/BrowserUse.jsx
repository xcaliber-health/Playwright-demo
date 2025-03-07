import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VNC_Url = import.meta.env.VITE_AGENT_VNC_URL;
const agentBackendUrl = import.meta.env.VITE_AGENT_BASE_URL;

const BrowserUse = () => {
  const [taskDescription, setTaskDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [vncStarted, setVncStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startVncSession = async () => {
    if (!taskDescription.trim()) {
      toast.error("Enter a task description!", { position: "top-right" });

      return;
    }

    setVncStarted(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${agentBackendUrl}/start_vnc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: taskDescription,
          task_description: additionalInfo,
        }),
      });
      const data = await response.json();
      // console.log("VNC Started:", data);
      setVncStarted(true);
    } catch (error) {
      console.error("Error starting VNC:", error);
      // toast.error("Error starting VNC:", { position: "top-right" });
      setVncStarted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full p-4 bg-[#0a0a0a] text-white">
      {/* Left Sidebar */}
      <div className="w-1/4 flex flex-col bg-[#171717] border border-[#2f2f2f] rounded-lg h-fit mr-4">
        <div className="px-4 mb-4">
        <h2 className="text-xl font-bold mb-4 text-[#e5e7eb] my-4">EHR Agent</h2>
          <h2 className="text-md font-semibold">Task Description</h2>
          <textarea
            className="w-full bg-[#262626] text-white p-2 pb-12 mt-2 rounded-md border border-[#2f2f2f] focus:outline-none text-sm"
            placeholder="Describe what you want the browser to do"
            onChange={(e) => setTaskDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="px-4  mb-4">
          <h2 className="text-md font-semibold">Additional Information</h2>
          <textarea
            className="w-full bg-[#262626] text-white p-2 pb-4 mt-2 rounded-lg border border-[#2f2f2f] focus:outline-none text-sm"
            placeholder="Add any helpful context or instructions..."
            onChange={(e) => setAdditionalInfo(e.target.value)}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex px-4 mb-2 gap-4">
          <button
            disabled={loading}
            onClick={startVncSession}
            className={`w-1/2 px-4 py-2 rounded-lg border border-[#2f2f2f] transition-all duration-200 
              ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#224acc] hover:bg-[#1b3a99]"
              }`}
          >
            {loading ? "Starting..." : "Run Agent"}
          </button>
          <button
            onClick={() => setVncStarted(false)}
            className="w-1/2 bg-[#1e3a8a] hover:bg-[#192e75] px-4 py-2 rounded-lg border border-[#2f2f2f] transition-all duration-200"
          >
            Stop
          </button>
          {error && <p className="text-red-500 text-sm px-4">{error}</p>}
        </div>
      </div>

      {/* Right Content Section */}
      {/* Right Content Section */}
      <div className="w-3/4 bg-[#171717] border border-[#2f2f2f] p-4 rounded-lg shadow-lg h-full relative">
        {vncStarted ? (
          <div className="w-full h-full bg-black border border-[#2f2f2f] rounded-lg relative">
            <iframe
              id="browser-viewer"
              className="w-full h-full absolute inset-0 border-none"
              title="Browser Viewer"
              src={`${VNC_Url}/vnc.html?autoconnect=true&resize=remote`}
            ></iframe>
          </div>
        ) : (
          <p className="text-center text-gray-400">
            Click "Run Agent" to start the session
          </p>
        )}
      </div>
    </div>
  );
};

export default BrowserUse;
