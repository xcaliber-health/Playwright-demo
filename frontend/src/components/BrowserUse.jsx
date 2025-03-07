import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CardAgent from "./ui/CardAgent";

const backendUrl = import.meta.env.VITE_AGENT_BASE_URL;
const VNC_Url = import.meta.env.VITE_AGENT_VNC_URL;

const prompts = [
  {
    prompt: "Patient Details App",
    displayText: "Patient Details App",
    placeholder: "View details...",
  },
  {
    prompt: "Patient Search App",
    displayText: "Patient Search App",
    placeholder: "Search patients...",
  },
  {
    prompt: "Diagnosis and Code Summary App",
    displayText: "Diagnosis Summary",
    placeholder: "View summary...",
  },
  {
    prompt: "Scheduling Workflow App",
    displayText: "Scheduling Workflow App",
    placeholder: "Manage schedules...",
  },
];

const BrowserUse = () => {
  const [taskDescription, setTaskDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const startSession = async (task) => {
    const finalTask = task || taskDescription;
    if (!finalTask.trim()) {
      toast.error("Please enter a task description.", {
        position: "top-right",
      });
      return;
    }

    setSessionStarted(true);
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/start_vnc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: finalTask,
          task_description: additionalInfo,
        }),
      });

      if (!response.ok) throw new Error("Session failed to start");

      await response.json();
    } catch (error) {
      console.error("Error starting session:", error);
      setSessionStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (promptText) => {
    toast.info(`"${promptText}" selected`, { position: "top-right" });
    setTaskDescription(promptText);
    startSession(promptText);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-60px)] overflow-hidden bg-[#0a0a0a] text-white">
      {!sessionStarted ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <h1 className="text-4xl font-bold mb-6">
            What workflows would you like to explore?
          </h1>

          <div className="relative w-2/4 bg-[#171717] border border-[#2f2f2f] rounded-lg p-4">
            {/* Fading border effect */}
            <div
              className="absolute inset-0 border-[#5A9EC7] border-t border-l rounded-lg pointer-events-none"
              style={{
                maskImage:
                  "linear-gradient(to right, rgba(90, 158, 199, 1), rgba(90, 158, 199, 0)), linear-gradient(to bottom, rgba(90, 158, 199, 1), rgba(90, 158, 199, 0))",
                WebkitMaskImage:
                  "linear-gradient(to right, rgba(90, 158, 199, 1), rgba(90, 158, 199, 0)), linear-gradient(to bottom, rgba(90, 158, 199, 1), rgba(90, 158, 199, 0))",
              }}
            ></div>

            {/* Textarea */}
            <textarea
              className="w-full bg-[#171717] text-white p-3 pb-14 rounded-md border border-[#2f2f2f] focus:outline-none text-sm resize-none"
              placeholder="Describe what you want the browser to do"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            ></textarea>

            {/* Button */}
            <div className="flex justify-end mt-3">
              <button
                disabled={loading}
                onClick={() => startSession()}
                className={`px-4 py-2 rounded-lg border border-[#2f2f2f] transition-all 
        ${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-[#224acc] hover:bg-[#1b3a99]"
        }`}
              >
                {loading ? "Starting..." : "Run Agent"}
              </button>
            </div>
          </div>

          {/* Cards Section */}
          <div className="w-full max-w-6xl mt-10 px-6">
            <h2 className="text-xl font-semibold">Community Apps</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {prompts.map((item, index) => (
                <CardAgent
                  key={index}
                  prompt={item.prompt}
                  displayText={item.displayText}
                  placeholder={item.placeholder}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full">
          <div className="w-1/4 h-full bg-[#0a0a0a] px-4 flex flex-col">
            <div className="bg-[#171717] p-4 rounded-lg border border-[#2f2f2f]">
              <h1 className="text-xl font-bold text-white mb-4">
                What workflows would you like to explore?
              </h1>
              <textarea
                className="w-full h-[100px] bg-[#171717] text-white p-2 rounded-md border border-[#2f2f2f] focus:outline-none text-sm"
                value={taskDescription}
                disabled
              ></textarea>
              <div className="flex gap-2 mt-4">
                <button
                  disabled={loading}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg border border-[#2f2f2f] cursor-not-allowed"
                >
                  Starting...
                </button>
                <button
                  onClick={() => setSessionStarted(false)}
                  className="flex-1 bg-[#224acc] hover:bg-[#1b3a99] text-white px-4 py-2 rounded-lg border border-[#2f2f2f]"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 h-full bg-[#171717] border border-[#2f2f2f] p-4 mb-2 rounded-lg mr-2">
            <div className="w-full h-full bg-black border border-[#2f2f2f] overflow-hidden">
              <iframe
                className="w-full h-full border-none "
                src={`${VNC_Url}/vnc.html?autoconnect=true&resize=remote`}
                title="Session Viewer"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserUse;
