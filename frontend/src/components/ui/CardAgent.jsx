import { ExternalLink } from "lucide-react";

const CardAgent = ({ prompt, displayText, placeholder, onCardClick }) => {
  return (
    <div
      className="relative border border-[#2f2f2f] backdrop-blur-md bg-[#171717]/50 shadow-lg rounded-2xl p-5 w-full max-w-xs h-36 flex flex-col justify-between transition-transform hover:scale-105 hover:shadow-xl cursor-pointer"
      onClick={() => onCardClick(prompt)}
    >
      {/* Title */}
      <h2 className="text-lg font-bold text-white tracking-wide">{displayText}</h2>

      {/* Placeholder */}
      <p className="text-sm text-gray-400">{placeholder}</p>

      {/* Export Icon */}
      <div className="flex justify-end">
        <button className="p-2 rounded-full bg-[#171717]/60 border border-[#2f2f2f] hover:bg-[#2f2f2f]/70 transition-all">
          <ExternalLink size={20} className="text-gray-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default CardAgent;
