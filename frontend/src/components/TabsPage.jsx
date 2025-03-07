import { useState } from "react";
import WebRecorder from "./WebRecorder";
import EhrOperator from "./EhrOperator";
import RecordingsPage from "./RecordingsPage";
import BrowserUse from "./BrowserUse";
import logo from "../assets/logo.png";

function TabsPage() {
  const [activeTab, setActiveTab] = useState("EHR Agent");

  return (
    <div className="w-full h-screen flex flex-col bg-[#0c111d]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-[#161b26] shadow-md">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EHR Operator Logo" className="h-8" />
          <h1 className="text-xl font-semibold text-white">EHR Operator</h1>
        </div>
      </nav>

      {/* Tabs */}
      <div className="flex flex-col">
        <div className="flex border-b bg-[#161b26] rounded-md">
          {["EHR Agent", "Recorder", "Replays"].map((tab) => (
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
      </div>

      {/* Main Content */}
      <div className="flex-grow flex">
        {/* {activeTab === "EHR Agent" && <EhrOperator />} */}
        {activeTab === "Recorder" && (
          <WebRecorder setActiveTab={setActiveTab} />
        )}
        {activeTab === "Replays" && <RecordingsPage />}
        {activeTab === "EHR Agent" && <BrowserUse />}
      </div>
    </div>
  );
}

export default TabsPage;
