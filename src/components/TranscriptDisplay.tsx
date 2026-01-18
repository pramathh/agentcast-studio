import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import type { ScriptItem } from '@/services/podcast-api';

interface TranscriptDisplayProps {
  script: ScriptItem[];
  onDownload: () => void;
}

export const TranscriptDisplay = ({ script, onDownload }: TranscriptDisplayProps) => {
  // Use a simple rendering approach for now, assuming script is already fully available
  // If typing animation is needed for structured data, it would require a complex hook update.
  // For now, let's just render the text directly to ensure correctness.

  const renderScript = (items: ScriptItem[]) => {
    return items.map((item, index) => {
      // Each item is { "Host": "...", "Guest": "..." } or similar
      // We iterate over keys to display them
      return (
        <div key={index} className="mb-4 space-y-2">
          {Object.entries(item).map(([speaker, text]) => (
            <div key={speaker}>
              <span className="text-primary font-semibold">{speaker}: </span>
              <span className="text-foreground">{text}</span>
            </div>
          ))}
        </div>
      );
    });
  };

  const downloadText = () => {
    // Convert structured script to text for download
    const textContent = script.map(item => {
      return Object.entries(item).map(([speaker, text]) => `${speaker}: ${text}`).join('\n');
    }).join('\n\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'podcast-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Transcript</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload} // keeping prop but using internal logic could be cleaner, user asked for specific download button for mp3, this is for text
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download Text
        </Button>
      </div>

      <div className="p-6 rounded-lg bg-secondary/50 border border-border max-h-96 overflow-y-auto">
        <div className="font-sans leading-relaxed">
          {renderScript(script)}
        </div>
      </div>
    </div>
  );
};
