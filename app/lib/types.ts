export interface Program {
  time: string;
  title: string;
  genre: string;
  duration: string;
  rating: number;
  isLive: boolean;
}

export interface ScheduleDay {
  day: string;
  date: string;
  programs: Program[];
}

// YouTube Video Interface for playlists
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  category: string;
  scheduledTime?: string;
}

export interface ChannelConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: string;
  streamUrl?: string;
  isYoutube?: boolean;
  youtubeVideoId?: string;
  youtubePlaylist?: YouTubeVideo[]; // For channels with multiple YouTube videos
}

export interface VideoPlayerProps {
  channel: ChannelConfig;
  isOpen: boolean;
  onClose: () => void;
  onPiPChange?: (isPiP: boolean) => void;
}

export type ViewMode = 'home' | 'schedule' | 'player' | 'usa-playlist';