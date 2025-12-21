import { Mic } from 'lucide-react';

interface LoadingOverlayProps {
  stage: 'script' | 'audio';
}

export const LoadingOverlay = ({ stage }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 p-8 rounded-xl bg-card border border-border animate-scale-in">
        {/* Microphone with pulse rings */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 pulse-ring" />
          <div className="absolute inset-0 rounded-full bg-primary/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
            <Mic className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Waveform animation */}
        <div className="flex items-center justify-center gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-primary to-accent rounded-full waveform-bar"
              style={{ height: '8px' }}
            />
          ))}
        </div>

        {/* Status text */}
        <div className="text-center">
          <p className="text-xl font-medium text-foreground">
            {stage === 'script' 
              ? '🎙️ Your podcast is being prepared...' 
              : '🎧 Converting to audio...'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {stage === 'script' 
              ? 'Our AI agents are crafting your script' 
              : 'Generating high-quality audio'}
          </p>
        </div>
      </div>
    </div>
  );
};
