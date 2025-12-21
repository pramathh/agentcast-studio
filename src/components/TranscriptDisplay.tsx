import { useTypingAnimation } from '@/hooks/use-typing-animation';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface TranscriptDisplayProps {
  script: string;
  onDownload: () => void;
}

export const TranscriptDisplay = ({ script, onDownload }: TranscriptDisplayProps) => {
  const { displayedText, isComplete } = useTypingAnimation({ text: script, speed: 15 });

  const formatScript = (text: string) => {
    // Split by speaker labels if they exist (e.g., "Host:", "Guest:")
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const speakerMatch = line.match(/^(\w+):\s*/);
      if (speakerMatch) {
        const speaker = speakerMatch[1];
        const content = line.replace(speakerMatch[0], '');
        return (
          <div key={index} className="mb-4">
            <span className="text-primary font-semibold">{speaker}: </span>
            <span className="text-foreground">{content}</span>
          </div>
        );
      }
      return (
        <p key={index} className="mb-4 text-foreground">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Transcript</h3>
        </div>
        {isComplete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        )}
      </div>
      
      <div className="p-6 rounded-lg bg-secondary/50 border border-border max-h-96 overflow-y-auto">
        <div className="font-sans leading-relaxed">
          {formatScript(displayedText)}
          {!isComplete && (
            <span className="inline-block w-2 h-5 bg-primary typing-cursor ml-1" />
          )}
        </div>
      </div>
    </div>
  );
};
