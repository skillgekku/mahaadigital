import { useState, useEffect } from 'react';
import { Clock, Calendar, Play, Star, ArrowLeft, Youtube } from 'lucide-react';
import { CHANNELS, MAHAA_USA_PLAYLIST, YouTubeVideo } from '@/app/lib/constants';

interface Program {
  time: string;
  title: string;
  genre: string;
  duration: string;
  rating: number;
  isLive: boolean;
}

interface ScheduleDay {
  day: string;
  date: string;
  programs: Program[];
}

interface ChannelConfig {
  name: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: string;
  isYoutube?: boolean;
}

interface ChannelsScheduleProps {
  channelIndex?: number;
  onBack?: () => void;
  onPlayVideo?: (videoId: string) => void;
}

export default function ChannelsSchedule({ channelIndex = 0, onBack, onPlayVideo }: ChannelsScheduleProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Channel configurations
const channels: ChannelConfig[] = [
  {
    name: 'Mahaa News',
    description: '24×7 News Channel',
    color: 'blue',
    bgGradient: 'from-blue-600 to-blue-800',
    icon: '📺'
  },
  {
    name: 'Mahaa Bhakti',
    description: '24×7 Devotional',
    color: 'orange',
    bgGradient: 'from-orange-600 to-orange-800',
    icon: '🙏'
  },
  {
    name: 'Mahaa Max',
    description: 'Unlimited Entertainment',
    color: 'purple',
    bgGradient: 'from-purple-600 to-purple-800',
    icon: '🎬'
  },
  {
    name: 'Mahaa USA',
    description: 'US Telugu Content',
    color: 'red',  // Changed from 'green' to 'red'
    bgGradient: 'from-red-600 to-red-800',  // Changed gradient
    icon: '🇺🇸',
    isYoutube: true
  }
];

  // Convert YouTube playlist to schedule format for Mahaa USA
  const getYouTubeSchedule = (): ScheduleDay[] => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    
    const todayPrograms: Program[] = MAHAA_USA_PLAYLIST.map(video => ({
      time: video.scheduledTime || '00:00',
      title: video.title,
      genre: video.category,
      duration: video.duration,
      rating: 4.5, // Default rating
      isLive: false
    })).sort((a, b) => a.time.localeCompare(b.time));

    const tomorrowPrograms: Program[] = MAHAA_USA_PLAYLIST.map(video => ({
      time: video.scheduledTime || '00:00',
      title: `${video.title} (Repeat)`,
      genre: video.category,
      duration: video.duration,
      rating: 4.5,
      isLive: false
    })).sort((a, b) => a.time.localeCompare(b.time));

    return [
      {
        day: 'Today',
        date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        programs: todayPrograms
      },
      {
        day: 'Tomorrow',
        date: tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        programs: tomorrowPrograms
      }
    ];
  };

  // Regular schedule data for other channels
  const getRegularSchedule = (): ScheduleDay[][] => [
    // Mahaa News Schedule
    [
      {
        day: 'Today',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
        date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
        date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
        date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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

  // Get the appropriate schedule based on channel
  const getCurrentSchedule = (): ScheduleDay[] => {
    if (channelIndex === 3) { // Mahaa USA
      return getYouTubeSchedule();
    }
    return getRegularSchedule()[channelIndex];
  };

  // Get current program for YouTube playlist
  const getCurrentYouTubeProgram = () => {
    if (channelIndex !== 3 || selectedDay !== 0) return null;
    
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    const todayPrograms = getCurrentSchedule()[0].programs;
    
    for (let i = 0; i < todayPrograms.length; i++) {
      const program = todayPrograms[i];
      const nextProgram = todayPrograms[i + 1];
      
      if (!nextProgram) {
        if (currentTimeStr >= program.time) return program;
      } else {
        if (currentTimeStr >= program.time && currentTimeStr < nextProgram.time) {
          return program;
        }
      }
    }
    return null;
  };

  const getCurrentProgram = () => {
    if (channelIndex === 3) { // Mahaa USA
      return getCurrentYouTubeProgram();
    }
    
    if (selectedDay !== 0) return null;
    
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    const todayPrograms = getCurrentSchedule()[0].programs;
    
    for (let i = 0; i < todayPrograms.length; i++) {
      const program = todayPrograms[i];
      const nextProgram = todayPrograms[i + 1];
      
      if (!nextProgram) {
        if (currentTimeStr >= program.time) return program;
      } else {
        if (currentTimeStr >= program.time && currentTimeStr < nextProgram.time) {
          return program;
        }
      }
    }
    return null;
  };

  const isCurrentProgram = (program: Program) => {
    if (selectedDay !== 0) return false;
    const currentProgram = getCurrentProgram();
    return currentProgram && currentProgram.time === program.time;
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      // News Channel Colors
      'Breaking News': 'bg-red-600',
      'News': 'bg-red-500',
      'Politics': 'bg-blue-600',
      'Business': 'bg-green-600',
      'Live Event': 'bg-purple-600',
      'Regional': 'bg-orange-500',
      'Investigation': 'bg-gray-600',
      'Crime': 'bg-red-700',
      'Health': 'bg-green-500',
      'Education': 'bg-blue-500',
      'Sports': 'bg-orange-600',
      'Debate': 'bg-purple-500',
      'Analysis': 'bg-indigo-500',
      'Review': 'bg-teal-500',
      'Documentary': 'bg-yellow-600',
      'Interview': 'bg-pink-500',
      'International': 'bg-cyan-600',
      'Technology': 'bg-gray-500',
      
      // Bhakti Channel Colors
      'Prayer': 'bg-orange-600',
      'Devotional Music': 'bg-orange-500',
      'Discourse': 'bg-yellow-600',
      'Live Darshan': 'bg-red-600',
      'Chanting': 'bg-purple-600',
      'Stories': 'bg-blue-500',
      'Movie': 'bg-red-500',
      'Aarti': 'bg-orange-700',
      'Biography': 'bg-green-600',
      'Kirtan': 'bg-purple-500',
      'Talk Show': 'bg-blue-600',
      'Music': 'bg-violet-500',
      'Meditation': 'bg-indigo-600',
      'Special': 'bg-pink-600',
      'Festival': 'bg-red-500',
      'Scripture': 'bg-yellow-500',
      'Yoga': 'bg-green-500',
      
      // Max Channel Colors
      'Comedy': 'bg-lime-500',
      'Reality TV': 'bg-pink-500',
      'Action Movie': 'bg-red-600',
      'Dance': 'bg-purple-500',
      'Romance Movie': 'bg-rose-500',
      'Game Show': 'bg-blue-500',
      'Drama Series': 'bg-indigo-600',
      'Thriller Movie': 'bg-gray-700',
      'Family Movie': 'bg-teal-500',
      'Children': 'bg-cyan-500',
      'Competition': 'bg-orange-500',
      'Music Show': 'bg-violet-600',
      
      // USA Channel Colors (YouTube Categories)
      'Conference': 'bg-blue-600',
      'Youth Event': 'bg-green-600',
      'Political': 'bg-red-600',
      'Awards': 'bg-yellow-600',
      'Entertainment': 'bg-purple-600',
      'Pageant': 'bg-pink-600',
      'Cultural': 'bg-teal-500',
      'Lifestyle': 'bg-purple-500',
      'Educational': 'bg-indigo-500',
      'Variety': 'bg-pink-500',
      'Cooking': 'bg-orange-600',
      'Family': 'bg-teal-500',
      'Travel': 'bg-emerald-500'
    };
    return colors[genre] || 'bg-gray-500';
  };

  // Handle YouTube video play
  const handlePlayYouTubeVideo = (program: Program) => {
    if (channelIndex === 3 && onPlayVideo) { // Mahaa USA
      // Find the corresponding YouTube video
      const video = MAHAA_USA_PLAYLIST.find(v => v.title === program.title.replace(' (Repeat)', ''));
      if (video) {
        onPlayVideo(video.youtubeId);
      }
    }
  };

  const currentChannel = channels[channelIndex];
  const currentSchedule = getCurrentSchedule();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentChannel.bgGradient} rounded-xl p-6 mb-8 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl">
              {currentChannel.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentChannel.name}</h1>
              <p className="text-gray-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{currentChannel.description} - Program Schedule</span>
                {currentChannel.isYoutube && (
                  <>
                    <Youtube className="w-4 h-4" />
                    <span>YouTube Playlist</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
            <div className="text-sm opacity-75">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex space-x-4 mb-6">
        {currentSchedule.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
  selectedDay === index
    ? `bg-gradient-to-r ${currentChannel.bgGradient} text-white shadow-lg`
    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
}`}
          >
            <div className="text-lg">{day.day}</div>
            <div className="text-sm opacity-75">{day.date}</div>
          </button>
        ))}
      </div>

      {/* Current Program Highlight */}
      {selectedDay === 0 && getCurrentProgram() && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-red-500 font-semibold">
                  {currentChannel.isYoutube ? 'NOW STREAMING' : 'NOW PLAYING'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {getCurrentProgram()?.title}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-400">
                    {getCurrentProgram()?.time}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs text-white ${getGenreColor(getCurrentProgram()?.genre || '')}`}>
                    {getCurrentProgram()?.genre}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-400">
                      {getCurrentProgram()?.rating}
                    </span>
                  </div>
                  {currentChannel.isYoutube && (
                    <div className="flex items-center space-x-1">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-400">YouTube</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                if (currentChannel.isYoutube && getCurrentProgram()) {
                  handlePlayYouTubeVideo(getCurrentProgram()!);
                }
              }}
              className={`bg-gradient-to-r ${currentChannel.bgGradient} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all`}
            >
              <Play className="w-4 h-4" />
              <span>{currentChannel.isYoutube ? 'Stream' : 'Watch'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Program Schedule Grid */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Clock className="w-6 h-6" />
          <span>{currentSchedule[selectedDay].day}'s Schedule</span>
          {currentChannel.isYoutube && (
            <div className="flex items-center space-x-2 ml-4">
              <Youtube className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-400">YouTube Playlist</span>
            </div>
          )}
        </h2>
        
        <div className="space-y-3">
          {currentSchedule[selectedDay].programs.map((program, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                isCurrentProgram(program)
                  ? 'bg-green-800 border-green-500'
                  : 'bg-gray-700 hover:bg-gray-600 border-transparent hover:border-green-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center min-w-[60px]">
                    <div className="text-lg font-bold text-white">
                      {program.time}
                    </div>
                    <div className="text-xs text-gray-400">
                      {program.duration}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-white">
                        {program.title}
                      </h3>
                      {program.isLive && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-red-500 text-xs font-medium">LIVE</span>
                        </div>
                      )}
                      {isCurrentProgram(program) && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {currentChannel.isYoutube ? 'STREAMING' : 'ON AIR'}
                        </span>
                      )}
                      {currentChannel.isYoutube && (
                        <Youtube className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs text-white ${getGenreColor(program.genre)}`}>
                        {program.genre}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-400">
                          {program.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isCurrentProgram(program) ? (
                    <button 
                      onClick={() => {
                        if (currentChannel.isYoutube) {
                          handlePlayYouTubeVideo(program);
                        }
                      }}
                      className={`bg-gradient-to-r ${currentChannel.bgGradient} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all`}
                    >
                      <Play className="w-4 h-4" />
                      <span>{currentChannel.isYoutube ? 'Stream' : 'Watch'}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (currentChannel.isYoutube) {
                          handlePlayYouTubeVideo(program);
                        }
                      }}
                      className="bg-gray-600 hover:bg-gray-500 text-gray-300 px-4 py-2 rounded-lg transition-colors"
                    >
                      {currentChannel.isYoutube ? 'Stream Video' : 'Set Reminder'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          &copy; 2025 Mahaa Digital. All times are in Eastern Time (ET).
          {currentChannel.isYoutube && (
            <span className="ml-2">• YouTube content available on-demand</span>
          )}
        </p>
      </div>
    </div>
  );
}