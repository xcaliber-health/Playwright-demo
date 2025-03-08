import { cn } from "../../lib/utils.js";
import { Menu, Bot, Server } from "lucide-react";
import logo from "../../assets/logo.png";

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsSidebarOpen }) => {
  const tabs = [
    { name: "Assistant", icon: <Bot size={22} /> }, 
    { name: "System", icon: <Server size={22} /> }, 
    // { name: "Replays", icon: <History size={22} /> } // Commented out
  ];

  // Refresh Page on Click
  const handleLogoClick = () => {
    window.location.reload(); 
  };

  return (
    <aside
      className={cn(
        "h-screen bg-[#171717] text-white flex flex-col transition-all duration-300",
        isOpen ? "w-64 p-4" : "w-16 p-2"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-4">
        {isOpen && (
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
        <button
          onClick={() => setIsSidebarOpen(!isOpen)}
          className="p-2 rounded-md text-white hover:bg-[#2f2f2f] transition flex justify-center hover:cursor-pointer"
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
                ? "bg-[#2f2f2f] text-white hover:cursor-pointer"
                : "text-gray-400 hover:bg-[#292929] hover:text-white hover:cursor-pointer",
              isOpen ? "px-4 py-3" : "py-3 justify-center"
            )}
          >
            <span className="w-6 h-6 flex items-center justify-center">
              {tab.icon}
            </span>
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
