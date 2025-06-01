
import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: React.ReactNode; 
  tooltipContent: React.ReactNode; 
  className?: string; 
  tooltipClassName?: string; 
}

export const Tooltip: React.FC<TooltipProps> = ({ text, tooltipContent, className, tooltipClassName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [positionClasses, setPositionClasses] = useState('bottom-full left-1/2 -translate-x-1/2 mb-2'); 
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let newPositionClasses = '';

      // Attempt to position above first
      if (triggerRect.top - tooltipRect.height - 8 > 0) { 
        newPositionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      } 
      // Else, try below
      else if (triggerRect.bottom + tooltipRect.height + 8 < viewportHeight) {
        newPositionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2';
      }
      // Else, try right
      else if (triggerRect.right + tooltipRect.width + 8 < viewportWidth) {
        newPositionClasses = 'top-1/2 -translate-y-1/2 left-full ml-2';
      }
      // Else, try left
      else if (triggerRect.left - tooltipRect.width - 8 > 0) {
         newPositionClasses = 'top-1/2 -translate-y-1/2 right-full mr-2';
      }
      // Default fallback
      else {
        newPositionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-90'; 
      }
      setPositionClasses(newPositionClasses);
    }
  }, [isVisible]);

  const tooltipId = React.useId();

  return (
    <span
      ref={triggerRef}
      className={`relative inline-block underline decoration-dotted decoration-yellow-500/70 cursor-help ${className || ''}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      // Removed onFocus, onBlur, and tabIndex to prevent focus stealing. 
      // Tooltip is now primarily mouse-driven.
      // For keyboard accessibility, the underlying content that `text` represents would need to be focusable.
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {text}
      {isVisible && (
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 w-max max-w-xs 
                     px-3 py-2 text-sm font-normal text-neutral-100 bg-neutral-900 rounded-lg shadow-xl border border-yellow-500/80
                     transition-opacity duration-200 ease-in-out
                     ${positionClasses} ${tooltipClassName || ''}
                    `}
          style={{ opacity: 1 }} 
        >
          {tooltipContent}
          <span 
            className={`absolute h-2 w-2 bg-neutral-900 border-yellow-500/80 rotate-45
            ${positionClasses.includes('bottom-full') ? 'border-t border-r top-full -translate-y-1/2 left-1/2 -translate-x-1/2' : ''}
            ${positionClasses.includes('top-full') ? 'border-b border-l bottom-full translate-y-1/2 left-1/2 -translate-x-1/2' : ''}
            ${positionClasses.includes('left-full') ? 'border-b border-r right-full translate-x-1/2 top-1/2 -translate-y-1/2' : ''}
            ${positionClasses.includes('right-full') ? 'border-t border-l left-full -translate-x-1/2 top-1/2 -translate-y-1/2' : ''}
            `} 
            style={{ 
              borderTopWidth: positionClasses.includes('bottom-full') || positionClasses.includes('right-full') ? '1px' : '0',
              borderRightWidth: positionClasses.includes('bottom-full') || positionClasses.includes('left-full') ? '1px' : '0',
              borderBottomWidth: positionClasses.includes('top-full') || positionClasses.includes('left-full') ? '1px' : '0',
              borderLeftWidth: positionClasses.includes('top-full') || positionClasses.includes('right-full') ? '1px' : '0',
             }}
            ></span>

        </span>
      )}
    </span>
  );
};
