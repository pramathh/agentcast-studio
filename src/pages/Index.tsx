import { useState } from 'react';
import { PodcastForm } from '@/components/PodcastForm';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { AudioPlayer } from '@/components/AudioPlayer';
import { generatePodcast, generateAudio, type PodcastRequest } from '@/services/podcast-api';
import { useToast } from '@/hooks/use-toast';
import { Podcast, Radio } from 'lucide-react';

type LoadingStage = 'idle' | 'script' | 'audio';

interface PodcastResult {
  script: string;
  audioUrl: string | null;
}

const Index = () => {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [result, setResult] = useState<PodcastResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (request: PodcastRequest) => {
    try {
      // Step 1: Generate script
      setLoadingStage('script');
      const podcastResponse = await generatePodcast(request);

      // Step 2: Generate audio
      setLoadingStage('audio');
      const audioResponse = await generateAudio(podcastResponse.script);

      setResult({
        script: podcastResponse.script,
        audioUrl: audioResponse.audio_url,
      });

      toast({
        title: 'Podcast Generated!',
        description: 'Your podcast is ready to play and download.',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoadingStage('idle');
    }
  };

  const handleDownloadTranscript = () => {
    if (!result?.script) return;
    
    const blob = new Blob([result.script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'podcast-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = () => {
    if (!result?.audioUrl) return;
    
    const a = document.createElement('a');
    a.href = result.audioUrl;
    a.download = 'podcast.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Overlay */}
      {loadingStage !== 'idle' && <LoadingOverlay stage={loadingStage} />}

      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Podcast className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AgentCast</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Podcast Generation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!result ? (
          // Form View
          <div className="flex flex-col items-center gap-12">
            {/* Hero Section */}
            <div className="text-center max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-6">
                <Radio className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Multiagent Podcast Generator</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="gradient-text">Create podcasts</span>
                <br />
                <span className="text-foreground">with AI agents</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Enter a topic, choose your style, and let our AI agents craft an engaging podcast script and audio for you.
              </p>
            </div>

            {/* Form */}
            <PodcastForm onSubmit={handleGenerate} isLoading={loadingStage !== 'idle'} />
          </div>
        ) : (
          // Results View
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Button */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Generate another podcast
            </button>

            {/* Results Header */}
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Podcast is Ready!</h2>
              <p className="text-muted-foreground">Listen to your generated podcast or download the files</p>
            </div>

            {/* Audio Player */}
            {result.audioUrl && (
              <AudioPlayer audioUrl={result.audioUrl} onDownload={handleDownloadAudio} />
            )}

            {/* Transcript */}
            <TranscriptDisplay script={result.script} onDownload={handleDownloadTranscript} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Powered by AI Agents • AgentCast
        </div>
      </footer>
    </div>
  );
};

export default Index;
