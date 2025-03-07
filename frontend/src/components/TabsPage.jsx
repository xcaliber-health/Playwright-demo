import { useState } from "react";
import WebRecorder from "./WebRecorder";
import EhrOperator from "./EhrOperator";
import RecordingsPage from "./RecordingsPage";
import BrowserUse from "./BrowserUse";
import logo from "../assets/logo.png";
import Sidebar from "../components/ui/Sidebar";

function TabsPage() {
  const [activeTab, setActiveTab] = useState("EHR Agent");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="w-full h-screen flex bg-[#0c111d]">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Navbar (Fixed Height) */}
        <nav className="flex items-center px-6 py-4 bg-[#161b26] shadow-md h-[64px]">
          {/* Show Logo & Title ONLY if Sidebar is closed */}
          {!isSidebarOpen && (
            <div className="flex items-center gap-3">
              <img src={logo} alt="EHR Operator Logo" className="h-8" />
              <h1 className="text-lg font-semibold text-white">EHR Operator</h1>
            </div>
          )}
        </nav>

        {/* Main Tab Content */}
        <div className="flex-grow flex">
          {activeTab === "Recorder" && (
            <WebRecorder setActiveTab={setActiveTab} />
          )}
          {activeTab === "Replays" && <RecordingsPage />}
          {activeTab === "EHR Agent" && <BrowserUse />}
        </div>
      </div>
    </div>
  );
}

export default TabsPage;
