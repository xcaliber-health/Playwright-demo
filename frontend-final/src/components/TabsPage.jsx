import { useState } from "react";
import WebRecorder from "./WebRecorder";
import EhrOperator from "./EhrOperator";
import RecordingsPage from "./RecordingsPage";

function TabsPage() {
  const [activeTab, setActiveTab] = useState("Tab1");

  return (
    <div className="p-8 w-full">
      <div className="flex justify-center border-b border-gray-200 w-full">
        {["Tab1", "Tab2", "Tab3"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-2 text-base font-medium transition-all rounded-t-md 
              ${
                activeTab === tab
                  ? "text-blue-600 after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[2px] after:bg-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4 w-full border border-gray-300 rounded-lg p-6 shadow-sm">
        {activeTab === "Tab1" && <EhrOperator />}
        {activeTab === "Tab2" && <WebRecorder />}
        {activeTab === "Tab3" && <RecordingsPage />}
      </div>
    </div>
  );
}

export default TabsPage;
