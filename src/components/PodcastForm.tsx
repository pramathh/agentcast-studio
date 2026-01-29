import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import type { PodcastRequest } from '@/services/podcast-api';

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'educational', label: 'Educational' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'inspirational', label: 'Inspirational' },
];

export const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Telugu', label: 'Telugu' },
];

interface PodcastFormProps {
  onSubmit: (data: PodcastRequest) => void;
  isLoading: boolean;
}

export const PodcastForm = ({ onSubmit, isLoading }: PodcastFormProps) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [language] = useState('English');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic && tone && language) {
      onSubmit({ topic, tone, language });
    }
  };

  const isValid = topic.trim() && tone && language;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6 animate-fade-in">
      {/* Topic Input */}
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-foreground font-medium">
          Topic
        </Label>
        <Input
          id="topic"
          placeholder="Enter your podcast topic (e.g., The future of AI in healthcare)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
        />
      </div>

      {/* Tone Select */}
      <div className="space-y-2 w-full">
        <Label htmlFor="tone" className="text-foreground font-medium">
          Tone
        </Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger className="h-12 bg-secondary border-border text-foreground">
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {TONES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-foreground hover:bg-secondary">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Generate Podcast
      </Button>
    </form>
  );
};
