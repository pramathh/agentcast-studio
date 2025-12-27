import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface TranscriptDisplayProps {
  script: Array<Record<string, string>>;
  onDownload: () => void;
}

export const TranscriptDisplay = ({ script, onDownload }: TranscriptDisplayProps) => {

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
          onClick={onDownload}
          disabled={!script || script.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <div className="p-6 rounded-lg bg-secondary/50 border border-border max-h-96 overflow-y-auto">
        <div className="font-sans leading-relaxed space-y-4">
          {script.map((turn, index) => (
            <div key={index} className="space-y-4">
              {Object.entries(turn).map(([speaker, text], subIndex) => (
                <div key={`${index}-${subIndex}`}>
                  <span className="text-primary font-semibold">{speaker}: </span>
                  <span className="text-foreground">{text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
