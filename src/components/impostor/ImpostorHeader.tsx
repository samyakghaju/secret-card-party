import { X } from "lucide-react";

interface ImpostorHeaderProps {
  onClose: () => void;
}

export const ImpostorHeader = ({ onClose }: ImpostorHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex-1" />
      <div className="text-center">
        <h1 className="font-display text-2xl tracking-tight text-ink">
          <span className="italic">IMPOSTER</span>
        </h1>
        <h2 className="font-display text-3xl font-black tracking-tight text-ink -mt-1">
          WHO?
        </h2>
      </div>
      <div className="flex-1 flex justify-end">
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-ink/10 transition-colors"
        >
          <X className="w-6 h-6 text-ink/60" />
        </button>
      </div>
    </div>
  );
};
