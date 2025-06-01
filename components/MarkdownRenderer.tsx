
import React from 'react';
import { Tooltip } from './Tooltip';

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

const SIEP_TOOLTIP_CONTENT = "Social Issues, Elections, or Politics. Content related to these topics often requires special authorization and disclaimers on platforms like Meta.";

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text, className }) => {
  if (text === null || text === undefined) return null;
  if (typeof text !== 'string') {
    console.warn("MarkdownRenderer received non-string text:", text);
    return <span className={className}>{String(text)}</span>;
  }


  // 1. Split by newline first to preserve paragraph structure
  // Using a regex that captures newlines so we can replace them with <br />
  const lines = text.split(/(\n)/g);

  const processedContent = lines.map((line, lineIndex) => {
    if (line === '\n') {
      return <br key={`br-${lineIndex}`} />;
    }
    if (!line) return null; // Skip empty strings that might result from split

    // Regex to find **bold text**, SIEP Authorization (case insensitive), or SIEP (case insensitive)
    // The capturing groups ensure these tokens are kept in the array
    const parts = line.split(/(\*\*.*?\*\*|SIEP\sAuthorization|SIEP)/gi).filter(part => part && part.trim().length > 0);

    return parts.map((part, partIndex) => {
      const key = `line-${lineIndex}-part-${partIndex}`;
      
      // Handle bold
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={key}>{part.substring(2, part.length - 2)}</strong>;
      }
      
      // Handle SIEP (case insensitive match, but display original casing)
      if (part.toLowerCase() === 'siep') {
        return <Tooltip key={key} text={part} tooltipContent={SIEP_TOOLTIP_CONTENT} />;
      }
      
      // Handle SIEP Authorization (case insensitive match, display original casing)
      if (part.toLowerCase() === 'siep authorization') {
        return <Tooltip key={key} text={part} tooltipContent={SIEP_TOOLTIP_CONTENT} />;
      }
      
      // Normal text
      return <span key={key}>{part}</span>;
    });
  });

  return <span className={className}>{processedContent}</span>;
};
