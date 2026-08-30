import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Repeat
} from 'lucide-react';

interface VideoPlayer916Props {
  src: string;
  poster?: string;
  title: string;
  autoPlay?: boolean;
}

export const VideoPlayer916: React.FC<VideoPlayer916Props> = ({
  src,
  poster,
  title,
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    if (autoPlay) {
      video.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay may require muted
        video.muted = true;
        setIsMuted(true);
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [src, autoPlay, isLooping]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Number(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[320px] sm:max-w-[340px] aspect-[9/16] rounded-3xl bg-[#020617] border-4 border-slate-800 shadow-2xl overflow-hidden group select-none flex flex-col justify-between"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Mobile Top Camera Notch / Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/90 rounded-full z-20 flex items-center justify-center gap-1.5 border border-slate-800 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
      </div>

      {/* Real HTML5 Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop={isLooping}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer bg-[#020617]"
      />

      {/* Play/Pause Overlay indicator */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-950/50 hover:scale-105 transition-transform backdrop-blur-sm">
            <Play className="w-7 h-7 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* 9:16 Aspect Overlay Badge */}
      <div className="absolute top-4 right-3 z-10 pointer-events-none">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-slate-300 backdrop-blur-md border border-white/10">
          9:16 HD
        </span>
      </div>

      {/* Custom Bottom Media Controls */}
      <div
        className={`absolute bottom-0 inset-x-0 p-3 pt-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 space-y-2 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar Scrubber */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="text-[11px] font-mono text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLooping ? 'text-indigo-400 bg-white/10' : 'text-slate-400 hover:bg-white/10'
              }`}
              title={isLooping ? 'Looping enabled' : 'Loop disabled'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
