import { ChannelConfig } from './types';

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
    youtubeVideoId: 'Izd-SLokbPY'
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