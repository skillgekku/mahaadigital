'use client';

import { ChannelConfig } from '@/app/lib/types';
import { CHANNELS } from '@/app/lib/constants';
import ChannelCard from './ChannelCard';

interface ChannelGridProps {
  onPlay: (channel: ChannelConfig) => void;
  onSchedule: (channelIndex: number) => void;
}

export default function ChannelGrid({ onPlay, onSchedule }: Readonly<ChannelGridProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {CHANNELS.map((channel, index) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          index={index}
          onPlay={onPlay}
          onSchedule={onSchedule}
        />
      ))}
    </div>
  );
}