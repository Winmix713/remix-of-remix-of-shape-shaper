import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultOpen = true,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-1 group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`} 
        />
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};