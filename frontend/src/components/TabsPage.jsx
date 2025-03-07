import { useState } from "react";
import WebRecorder from "./WebRecorder";
import EhrOperator from "./EhrOperator";
import RecordingsPage from "./RecordingsPage";
import BrowserUse from "./BrowserUse";
import logo from "../assets/logo.png";
import Sidebar from "../components/ui/Sidebar";
import { Bot, Server } from "lucide-react";

function TabsPage() {
  const [activeTab, setActiveTab] = useState("Assistant");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Refresh Page on Click
  const handleLogoClick = () => {
    window.location.reload(); // Refresh the page
  };

  return (
    <div className="w-full h-screen flex bg-[#0a0a0a]">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <nav className="flex items-center px-6 py-4 bg-[#0a0a0a] shadow-md h-[56px]">
          {!isSidebarOpen && (
            <div
              className="flex items-center gap-3 cursor-pointer hover:animate-pulse active:scale-95 transition-transform duration-150"
              onClick={handleLogoClick}
            >
              <img
                src={logo}
                alt="EHR Operator Logo"
                className="h-8 filter hover:brightness-125 transition"
              />
              <h1 className="text-lg font-semibold text-white hover:text-gray-300 transition duration-150">
                EHR Operator
              </h1>
            </div>
          )}
        </nav>

        {/* Main Tab Content */}
        <div className="flex-grow flex">
          {activeTab === "System" && (
            <WebRecorder setActiveTab={setActiveTab} />
          )}
          {/* Commented out the "Replays" tab */}
          {/* {activeTab === "Replays" && <RecordingsPage />} */}
          {activeTab === "Assistant" && <BrowserUse />}
        </div>
      </div>
    </div>
  );
}

export default TabsPage;
