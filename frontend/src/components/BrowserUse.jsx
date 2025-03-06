import React, { useState } from "react";

const VNC_Url = import.meta.env.VITE_VNC_URL;

const BrowserUse = () => {
  const [taskDescription, setTaskDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [vncStarted, setVncStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  
    const startVncSession = async () => {
      if (!taskDescription.trim()) {
        alert("Please enter a task description.");
        return;
      }
  
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/start_vnc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task: taskDescription, // Sending task
            task_description: additionalInfo, // Sending additional info
          }),
        });
        const data = await response.json();
        console.log("VNC Started:", data);
        setVncStarted(true); // Show iframe after starting VNC
      } catch (error) {
        console.error("Error starting VNC:", error);
        alert("Error starting VNC session. Check console for details.");
      } finally {
        setLoading(false); // Re-enable button
      }
    };

  return (
    <div className="flex h-screen w-full p-4 bg-[#0c111d] text-white">
      {/* Left Sidebar */}
      <div className="w-1/4 flex flex-col bg-[#161b26] border border-[#333741] rounded-lg self-start py-2 mr-4">
        <div className="p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold">Task Description</h2>
          <textarea
            className="w-full bg-[#0c111d] text-white p-2 pb-10 mt-2 rounded-md border border-[#333741] focus:outline-none"
            placeholder="Describe what you want the browser to do"
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

        {/* Buttons */}
        <div className="flex px-4 mb-2 gap-4">
          <button
            disabled={loading}
            onClick={startVncSession} 
            className={`w-1/2 px-4 py-2 rounded-lg border border-[#333741] transition-all duration-200 
              ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-[#224acc] hover:bg-[#1b3a99]"}`}

          >
           {loading ? "Starting..." : "Run Agent"}
          </button>
          <button
            onClick={() => setVncStarted(false)}
            className="w-1/2 bg-[#1e3a8a] hover:bg-[#192e75] px-4 py-2 rounded-lg border border-[#333741] transition-all duration-200"
          >
            Stop
          </button>
        </div>
      </div>

      {/* Right Content Section */}
      <div className="w-3/4 bg-[#161b26] border border-[#333741] p-4 rounded-lg shadow-lg">
      {vncStarted ? (<div className="w-full h-full bg-black border border-[#333741] rounded-lg">
          <iframe
            id="browser-viewer"
            className="w-full h-full border-none"
            title="Browser Viewer"
            src={`${VNC_Url}/vnc.html?autoconnect=true&resize=remote`}
          ></iframe>
        </div>
        ) : (
          <p className="text-center text-gray-400">Click "Run Agent" to start VNC session</p>
        )}
      </div>
    </div>
  );
};

export default BrowserUse;
