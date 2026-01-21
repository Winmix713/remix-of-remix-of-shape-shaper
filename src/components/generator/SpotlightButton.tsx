import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SpotlightButtonProps {
  onTrigger: () => void;
}

export const SpotlightButton: React.FC<SpotlightButtonProps> = ({ onTrigger }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Trigger the color change after fade out
    setTimeout(() => {
      onTrigger();
    }, 400);
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 900);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-all duration-200 ${
        isAnimating ? 'scale-90' : 'hover:scale-105'
      }`}
      title="Random Spotlight"
    >
      <Sparkles 
        className={`text-black dark:text-white w-4 h-4 transition-all duration-300 ${
          isAnimating ? 'rotate-180 scale-75' : ''
        }`} 
      />
    </button>
  );
};
