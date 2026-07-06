import React from 'react';

interface ButtonPreviewProps {
  text: string;
  variant: 'solid' | 'outline' | 'filled';
  isLoading: boolean;
  isSuccess: boolean;
  onClick: () => void;
}

export const BuyButton: React.FC<ButtonPreviewProps> = ({
  text,
  variant,
  isLoading,
  isSuccess,
  onClick
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'solid':
        return 'bg-white text-black hover:bg-gray-200 active:scale-95 shadow-white/10';
      case 'outline':
        return 'bg-transparent border-2 border-white/40 text-white hover:bg-white/10 active:scale-95';
      case 'filled':
        return 'bg-[#BB4D0F] text-white hover:bg-[#d15611] border border-white/10 active:scale-95';
      default:
        return '';
    }
  };

  const getGlowStyles = () => {
    switch (variant) {
      case 'solid': return 'bg-white';
      case 'filled': return 'bg-[#BB4D0F]';
      case 'outline': return 'bg-white/40';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={isLoading || isSuccess}
        className={`
          relative min-w-[260px] h-[74px] rounded-[28px] px-[42px] flex items-center justify-center
          font-bold text-xl tracking-tight transition-all duration-300 shadow-2xl
          disabled:cursor-default overflow-hidden
          ${getVariantStyles()}
        `}
      >
        {/* Loading Spinner Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="truncate">
            {isLoading ? 'Behandler...' : isSuccess ? 'Fullført' : text}
          </span>
        </div>
      </button>
      <div className={`
        absolute -inset-1 rounded-[28px] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10
        ${getGlowStyles()}
      `} />
    </div>
  );
};
