import { useState } from 'react';
import { PodcastForm } from '@/components/PodcastForm';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { generatePodcast, generateTTS, type PodcastRequest } from '@/services/podcast-api';
import { useToast } from '@/hooks/use-toast';
import { Podcast, Radio, Download, Play, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type LoadingStage = 'idle' | 'script';

interface PodcastResult {
  script: Array<Record<string, string>>;
  language: string;
  topic: string;
}

const Index = () => {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [result, setResult] = useState<PodcastResult | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (request: PodcastRequest) => {
    try {
      // Step 1: Generate script
      setLoadingStage('script');
      const podcastResponse = await generatePodcast(request);

      // Backend returns a structured list
      const scriptData = podcastResponse.script;

      setResult({
        script: scriptData,
        language: podcastResponse.language,
        topic: request.topic,
      });

      toast({
        title: 'Podcast Generated!',
        description: 'Your podcast is ready to play and download.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoadingStage('idle');
    }
  };

  const handleGenerateAudio = async () => {
    if (!result) return;

    setIsGeneratingAudio(true);
    try {
      const ttsResponse = await generateTTS({
        script: result.script,
        language: result.language,
      });

      const audioPath = ttsResponse.audio_file;
      setAudioUrl(audioPath);

      toast({
        title: 'Audio Generated!',
        description: 'You can now listen to your podcast.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Audio Generation Failed',
        description: error instanceof Error ? error.message : 'Could not generate audio',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioUrl || !result) return;

    const safeTopic = result.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeLanguage = result.language.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeTopic}_${safeLanguage}.mp3`;

    // Create a temporary anchor element to trigger download
    // Since audioUrl is likely a relative path or URL, we can use it directly if it's served with correct headers
    // Or fetch it as blob if needed. Let's try direct link download first.
    // If audioUrl is just a path, creating an anchor with 'download' attribute should work for same-origin or allowed cors.

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadTranscript = () => {
    if (!result?.script) return;

    // Convert structured script to text
    const textContent = result.script.map(turn => {
      return Object.entries(turn)
        .map(([speaker, text]) => `${speaker}: ${text}`)
        .join('\n');
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
  };



  const handleReset = () => {
    setResult(null);
    setAudioUrl(null);
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

            {/* Audio Player Section */}
            <Card className="overflow-hidden border-border/50 shadow-lg bg-card/50 backdrop-blur-sm animate-fade-in">
              <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-6">
                {!audioUrl ? (
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <Podcast className="w-8 h-8" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold tracking-tight">Generate Audio</h3>
                      <p className="text-muted-foreground">
                        Turn this script into a lifelike podcast conversation with AI voices.
                      </p>
                    </div>

                    <Button
                      onClick={handleGenerateAudio}
                      disabled={isGeneratingAudio}
                      size="lg"
                      className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-medium shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Audio...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5 fill-current" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <Podcast className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">{result.topic}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{result.language} • Audio Generated</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadAudio}
                        className="gap-2 hover:bg-secondary"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>

                    <div className="bg-background/50 rounded-xl p-4 border border-border/50 shadow-sm">
                      <audio controls className="w-full h-10 accent-primary" src={audioUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript */}
            {/* Transcript */}
            {result.script ? (
              <TranscriptDisplay script={result.script} onDownload={handleDownloadTranscript} />
            ) : (
              <div className="text-center p-8 bg-secondary/30 rounded-lg">
                <p className="text-muted-foreground">No script was generated. Please try again with a different topic.</p>
              </div>
            )}
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
