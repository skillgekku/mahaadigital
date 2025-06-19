// Updated constants.ts - Change Mahaa USA color scheme to red

import { ChannelConfig, YouTubeVideo, ScheduleDay } from './types';

// YouTube playlist for Mahaa USA (unchanged)
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
    title: 'Mahaa ICON ',
    description: '',
    youtubeId: 'tq6kVYunCTk',
    duration: '3:20:15',
    category: 'Awards',
    scheduledTime: '16:30'
  },
  {
    id: 'miss-telugu-usa-2025',
    title: 'Miss Telugu USA 2025',
    description: 'Beauty pageant celebrating Telugu culture and heritage in America',
    youtubeId: 'InVguI9nIW4&t=322s',
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
    color: 'red', // Changed from 'green' to 'red'
    bgGradient: 'from-red-600 to-red-800', // Changed from 'from-green-600 to-green-800'
    icon: '🇺🇸',
    isYoutube: true,
    youtubeVideoId: 'Izd-SLokbPY',
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

// Regular schedule data for other channels
export const REGULAR_SCHEDULE_DATA: ScheduleDay[][] = [
  // Mahaa News Schedule
  [
    {
      day: 'Today',
      date: 'Today_Placeholder', // Replaced dynamic date
      programs: [
        { time: '06:00', title: 'Morning Headlines', genre: 'Breaking News', duration: '60 min', rating: 4.8, isLive: false },
        { time: '07:00', title: 'News Breakfast', genre: 'News', duration: '90 min', rating: 4.5, isLive: false },
        { time: '08:30', title: 'Political Roundtable', genre: 'Politics', duration: '60 min', rating: 4.3, isLive: false },
        { time: '09:30', title: 'Business Today', genre: 'Business', duration: '30 min', rating: 4.1, isLive: false },
        { time: '10:00', title: 'Live Press Conference', genre: 'Live Event', duration: '60 min', rating: 4.6, isLive: true },
        { time: '11:00', title: 'Regional Updates', genre: 'Regional', duration: '30 min', rating: 4.2, isLive: false },
        { time: '11:30', title: 'Special Investigation', genre: 'Investigation', duration: '60 min', rating: 4.7, isLive: false },
        { time: '12:30', title: 'Noon Bulletin', genre: 'News', duration: '30 min', rating: 4.4, isLive: false },
        { time: '13:00', title: 'Crime Watch', genre: 'Crime', duration: '60 min', rating: 4.5, isLive: false },
        { time: '14:00', title: 'Health Report', genre: 'Health', duration: '30 min', rating: 4.2, isLive: false },
        { time: '14:30', title: 'Education Focus', genre: 'Education', duration: '60 min', rating: 4.0, isLive: false },
        { time: '15:30', title: 'Sports Update', genre: 'Sports', duration: '30 min', rating: 4.3, isLive: false },
        { time: '16:00', title: 'Evening News', genre: 'News', duration: '60 min', rating: 4.6, isLive: false },
        { time: '17:00', title: 'Prime Time Debate', genre: 'Debate', duration: '90 min', rating: 4.8, isLive: false },
        { time: '18:30', title: 'Breaking Coverage', genre: 'Breaking News', duration: '90 min', rating: 4.7, isLive: false },
        { time: '20:00', title: 'Night News', genre: 'News', duration: '60 min', rating: 4.9, isLive: false },
        { time: '21:00', title: 'Late Night Analysis', genre: 'Analysis', duration: '90 min', rating: 4.4, isLive: false }
      ]
    },
    {
      day: 'Tomorrow',
      date: 'Tomorrow_Placeholder', // Replaced dynamic date
      programs: [
        { time: '06:00', title: 'Weekend Morning News', genre: 'News', duration: '120 min', rating: 4.5, isLive: false },
        { time: '08:00', title: 'Week in Review', genre: 'Review', duration: '60 min', rating: 4.3, isLive: false },
        { time: '09:00', title: 'Special Report', genre: 'Documentary', duration: '90 min', rating: 4.6, isLive: false },
        { time: '10:30', title: 'Interview Series', genre: 'Interview', duration: '60 min', rating: 4.4, isLive: false },
        { time: '11:30', title: 'Global Update', genre: 'International', duration: '30 min', rating: 4.1, isLive: false },
        { time: '12:00', title: 'Technology News', genre: 'Technology', duration: '60 min', rating: 4.2, isLive: false }
      ]
    }
  ],
  // Mahaa Bhakti Schedule
  [
    {
      day: 'Today',
      date: 'Today_Placeholder', // Replaced dynamic date
      programs: [
        { time: '06:00', title: 'Morning Prayers', genre: 'Prayer', duration: '60 min', rating: 4.9, isLive: false },
        { time: '07:00', title: 'Bhajan Sandhya', genre: 'Devotional Music', duration: '90 min', rating: 4.8, isLive: false },
        { time: '08:30', title: 'Spiritual Discourse', genre: 'Discourse', duration: '60 min', rating: 4.7, isLive: false },
        { time: '09:30', title: 'Temple Live', genre: 'Live Darshan', duration: '60 min', rating: 4.9, isLive: true },
        { time: '10:30', title: 'Vedic Chanting', genre: 'Chanting', duration: '30 min', rating: 4.6, isLive: false },
        { time: '11:00', title: 'Mythology Stories', genre: 'Stories', duration: '60 min', rating: 4.5, isLive: false },
        { time: '12:00', title: 'Devotional Cinema', genre: 'Movie', duration: '150 min', rating: 4.7, isLive: false },
        { time: '14:30', title: 'Aarti Special', genre: 'Aarti', duration: '30 min', rating: 4.8, isLive: false },
        { time: '15:00', title: 'Saint Biography', genre: 'Biography', duration: '60 min', rating: 4.4, isLive: false },
        { time: '16:00', title: 'Kirtan Session', genre: 'Kirtan', duration: '90 min', rating: 4.6, isLive: false },
        { time: '17:30', title: 'Evening Prayers', genre: 'Prayer', duration: '60 min', rating: 4.8, isLive: false },
        { time: '18:30', title: 'Spiritual Talk', genre: 'Talk Show', duration: '60 min', rating: 4.3, isLive: false },
        { time: '19:30', title: 'Devotional Songs', genre: 'Music', duration: '90 min', rating: 4.7, isLive: false },
        { time: '21:00', title: 'Night Meditation', genre: 'Meditation', duration: '60 min', rating: 4.5, isLive: false }
      ]
    },
    {
      day: 'Tomorrow',
      date: 'Tomorrow_Placeholder', // Replaced dynamic date
      programs: [
        { time: '06:00', title: 'Weekend Prayers', genre: 'Prayer', duration: '90 min', rating: 4.8, isLive: false },
        { time: '07:30', title: 'Devotional Special', genre: 'Special', duration: '120 min', rating: 4.6, isLive: false },
        { time: '09:30', title: 'Temple Festival', genre: 'Festival', duration: '180 min', rating: 4.9, isLive: false },
        { time: '12:30', title: 'Sacred Texts', genre: 'Scripture', duration: '60 min', rating: 4.5, isLive: false },
        { time: '13:30', title: 'Yoga & Spirituality', genre: 'Yoga', duration: '90 min', rating: 4.4, isLive: false }
      ]
    }
  ],
  // Mahaa Max Schedule
  [
    {
      day: 'Today',
      date: 'Today_Placeholder', // Replaced dynamic date
      programs: [
        { time: '06:00', title: 'Comedy Morning', genre: 'Comedy', duration: '90 min', rating: 4.5, isLive: false },
        { time: '07:30', title: 'Music Videos', genre: 'Music', duration: '60 min', rating: 4.3, isLive: false },
        { time: '08:30', title: 'Reality Show Highlights', genre: 'Reality TV', duration: '60 min', rating: 4.4, isLive: false },
        { time: '09:30', title: 'Blockbuster Movie', genre: 'Action Movie', duration: '180 min', rating: 4.8, isLive: false },
        { time: '12:30', title: 'Celebrity Talk', genre: 'Talk Show', duration: '60 min', rating: 4.2, isLive: false },
        { time: '13:30', title: 'Dance Competition', genre: 'Dance', duration: '90 min', rating: 4.6, isLive: true },
        { time: '15:00', title: 'Romantic Drama', genre: 'Romance Movie', duration: '150 min', rating: 4.7, isLive: false },
        { time: '17:30', title: 'Game Show Live', genre: 'Game Show', duration: '60 min', rating: 4.4, isLive: false },
        { time: '18:30', title: 'Prime Time Series', genre: 'Drama Series', duration: '90 min', rating: 4.9, isLive: false },
        { time: '20:00', title: 'Mega Movie Night', genre: 'Thriller Movie', duration: '150 min', rating: 4.8, isLive: false },
        { time: '22:30', title: 'Late Night Comedy', genre: 'Comedy', duration: '90 min', rating: 4.3, isLive: false }
      ]
    },
    {
      day: 'Tomorrow',
      date: 'Tomorrow_Placeholder', // Replaced dynamic date
      programs: [
        { time: '06:00', title: 'Weekend Special Movie', genre: 'Family Movie', duration: '180 min', rating: 4.6, isLive: false },
        { time: '09:00', title: 'Kids Entertainment', genre: 'Children', duration: '120 min', rating: 4.5, isLive: false },
        { time: '11:00', title: 'Talent Hunt', genre: 'Competition', duration: '90 min', rating: 4.4, isLive: false },
        { time: '12:30', title: 'Weekend Blockbuster', genre: 'Action Movie', duration: '180 min', rating: 4.9, isLive: false },
        { time: '15:30', title: 'Musical Night', genre: 'Music Show', duration: '120 min', rating: 4.7, isLive: false }
      ]
    }
  ]
];