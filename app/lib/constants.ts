import { ChannelConfig } from './types';

// YouTube Video Interface for Mahaa USA
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  category: string;
  scheduledTime?: string;
}

// YouTube playlist for Mahaa USA
export const MAHAA_USA_PLAYLIST: YouTubeVideo[] = [
  {
    id: 'nats-8th-conference',
    title: 'NATS 8th Conference',
    description: 'North American Telugu Society 8th annual conference highlights and cultural programs',
    youtubeId: 'UTArkqpGGCw',
    duration: '2:00:30',
    category: 'Conference',
    scheduledTime: '06:00'
  },
  {
    id: 'tana-24th-conference',
    title: 'TANA 24th Conference',
    description: 'Telugu Association of North America 24th Annual Conference - Complete coverage',
    youtubeId: 'Izd-SLokbPY',
    duration: '2:45:30',
    category: 'Conference',
    scheduledTime: '09:00'
  },
  {
    id: 'tana-youth-conference-2025',
    title: 'TANA Youth Conference 2025',
    description: 'Young Telugu professionals gathering, networking event and cultural programs',
    youtubeId: 'kS9L0lz0EWM',
    duration: '1:30:45',
    category: 'Youth Event',
    scheduledTime: '11:45'
  },
  {
    id: 'ktr-dallas',
    title: 'KTR in Dallas',
    description: 'KT Rama Rao visit to Dallas - Political discussions and community interaction',
    youtubeId: 'wf8tDgoCuX4',
    duration: '2:15:20',
    category: 'Political',
    scheduledTime: '14:00'
  },
  {
    id: 'mahaa-icon',
    title: 'Mahaa ICON Awards',
    description: 'Prestigious awards ceremony celebrating Telugu excellence in North America',
    youtubeId: 'tq6kVYunCTk',
    duration: '3:20:15',
    category: 'Awards',
    scheduledTime: '16:30'
  },
  {
    id: 'miss-telugu-usa-2025',
    title: 'Miss Telugu USA 2025',
    description: 'Beauty pageant celebrating Telugu culture and heritage in America',
    youtubeId: 'RcIX4xjTkf0',
    duration: '2:30:15',
    category: 'Pageant',
    scheduledTime: '19:00'
  },
  {
    id: 'kannappa-manchu-vishnu',
    title: 'Kannappa - Manchu Vishnu in USA',
    description: 'Actor Manchu Vishnu promotes his upcoming mythological film Kannappa',
    youtubeId: '3erbr7GN3UI',
    duration: '1:45:30',
    category: 'Entertainment',
    scheduledTime: '20:00'
  },
  {
    id: 'rana-daggubati-loca-loka',
    title: 'Rana Daggubati - Loca Loka',
    description: 'Popular Telugu actor Rana Daggubati in exclusive interview and interaction',
    youtubeId: '-A_xRPsKSWg',
    duration: '1:20:45',
    category: 'Interview',
    scheduledTime: '22:00'
  }
];

export const CHANNELS: ChannelConfig[] = [
  {
    id: 'mahaa-news',
    name: 'Mahaa News',
    description: '24×7 News Channel',
    color: 'blue',
    bgGradient: 'from-blue-600 to-blue-800',
    icon: '📺',
    streamUrl: 'https://distro.legitpro.co.in/mahaanews/index.m3u8'
  },
  {
    id: 'mahaa-bhakti',
    name: 'Mahaa Bhakti',
    description: '24×7 Devotional',
    color: 'orange',
    bgGradient: 'from-orange-600 to-orange-800',
    icon: '🙏',
    streamUrl: 'https://bhakti.mahaaone.com/hls/test.m3u8'
  },
  {
    id: 'mahaa-max',
    name: 'Mahaa Max',
    description: 'Unlimited Entertainment',
    color: 'purple',
    bgGradient: 'from-purple-600 to-purple-800',
    icon: '🎬',
    streamUrl: 'https://distro.legitpro.co.in/mahaamaxx/index.m3u8'
  },
  {
    id: 'mahaa-usa',
    name: 'Mahaa USA',
    description: 'US Telugu Content',
    color: 'green',
    bgGradient: 'from-green-600 to-green-800',
    icon: '🇺🇸',
    isYoutube: true,
    youtubeVideoId: 'Izd-SLokbPY', // Default to first video in playlist
    youtubePlaylist: MAHAA_USA_PLAYLIST
  }
];

export const THEME_CLASSES = {
  light: {
    body: "bg-gradient-to-br from-gray-50 via-white to-gray-100",
    header: "bg-gradient-to-r from-red-500 to-red-700",
    card: "bg-white border-gray-200 hover:border-gray-300 shadow-lg",
    title: "text-gray-900",
    subtitle: "text-gray-600",
    description: "text-gray-500",
    footer: "bg-gray-900 text-gray-300 border-gray-700"
  },
  dark: {
    body: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
    header: "bg-gradient-to-r from-red-600 to-red-800",
    card: "bg-gray-800 border-gray-700 hover:border-gray-600",
    title: "text-white",
    subtitle: "text-gray-300",
    description: "text-gray-400",
    footer: "bg-black text-gray-400 border-gray-800"
  }
};