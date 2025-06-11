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
}

export interface VideoPlayerProps {
  channel: ChannelConfig;
  isOpen: boolean;
  onClose: () => void;
}

export type ViewMode = 'home' | 'schedule' | 'player';