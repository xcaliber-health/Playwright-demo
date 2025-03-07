import { cn } from "../../lib/utils.js";
import { Video, History, Book, Menu } from "lucide-react";
import logo from "../../assets/logo.png";

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsSidebarOpen }) => {
  const tabs = [
    { name: "EHR Agent", icon: <Book size={22} /> },
    { name: "Recorder", icon: <Video size={22} /> },
    { name: "Replays", icon: <History size={22} /> }
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-[#161b26] text-white flex flex-col transition-all duration-300",
        isOpen ? "w-64 p-4" : "w-16 p-2"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-4">
        {isOpen && (
          <div className="flex items-center gap-3">
            <img src={logo} alt="EHR Operator Logo" className="h-8" />
            <h1 className="text-lg font-semibold">EHR Operator</h1>
          </div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isOpen)}
          className="p-2 rounded-md text-white hover:bg-[#252b38] transition flex justify-center"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-col space-y-2 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={cn(
              "flex items-center w-full rounded-md text-lg transition-all",
              activeTab === tab.name
                ? "bg-[#374151] text-white"
                : "text-gray-400 hover:bg-[#252b38] hover:text-white",
              isOpen ? "px-4 py-3" : "py-3 justify-center"
            )}
          >
            {/* Always Centered Icon */}
            <span className="w-6 h-6 flex items-center justify-center">
              {tab.icon}
            </span>
            {/* Text Disappears When Collapsed */}
            <span
              className={cn(
                "ml-3 transition-all duration-200",
                isOpen ? "opacity-100" : "opacity-0 hidden"
              )}
            >
              {tab.name}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
