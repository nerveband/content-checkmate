import React, { useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from './icons';

interface VideoPlayerProps {
  videoSrc: string;
  jumpToTimestamp?: number;
  onTimestampJump?: (timestamp: number) => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoSrc, 
  jumpToTimestamp, 
  onTimestampJump,
  className = "" 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  useEffect(() => {
    if (jumpToTimestamp !== undefined && videoRef.current) {
      videoRef.current.currentTime = jumpToTimestamp;
      videoRef.current.play();
      setIsPlaying(true);
      onTimestampJump?.(jumpToTimestamp);
    }
  }, [jumpToTimestamp, onTimestampJump]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controls
      />
      
      {/* Custom overlay with timestamp info */}
      <div className="absolute bottom-16 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
      
      {/* Play/Pause button overlay */}
      <button
        onClick={handlePlayPause}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-75 hover:opacity-100"
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
      >
        {isPlaying ? (
          <PauseIcon className="w-6 h-6" />
        ) : (
          <PlayIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};