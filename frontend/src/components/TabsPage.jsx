import { useState } from "react";
import WebRecorder from "./WebRecorder";
import EhrOperator from "./EhrOperator";
import RecordingsPage from "./RecordingsPage";
import logo from "../assets/logo.png";


function TabsPage() {
  const [activeTab, setActiveTab] = useState("Agent");

  return (
    <div className="w-full bg-[#0c111d] min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-[#161b26] shadow-md">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EHR Operator Logo" className="h-8" />
          <h1 className="text-xl font-semibold text-white">EHR Operator</h1>
        </div>
      </nav>
      
      {/* Tabs */}
      <div className="p-8 w-full">
        <div className="flex justify-start border-b bg-[#161b26] w-full rounded-md">
          {["Agent", "Recorder", "Replays"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-2 text-base font-medium transition-all rounded-t-md 
                ${
                  activeTab === tab
                    ? "text-white bg-[#374151] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-blue-600"
                    : "text-white hover:text-gray-400"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4 w-full rounded-lg">
          {activeTab === "Agent" && <EhrOperator />}
          {activeTab === "Recorder" && <WebRecorder setActiveTab={setActiveTab} />}
          {activeTab === "Replays" && <RecordingsPage />}
        </div>
      </div>
    </div>
  );
}

export default TabsPage;