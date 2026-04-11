'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

export default function MusicPage() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setProgress(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [])

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#223318] to-[#2d3d27] shadow-lg">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      >
        <source src="/music/whoyoushouldbewith.mp3" type="audio/mpeg" />
      </audio>

      {/* Desktop Layout */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-4 items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-100 text-[#223318] rounded-full transition-colors flex-shrink-0 shadow-md"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-[#223318]" />
          ) : (
            <Play className="w-6 h-6 fill-[#223318]" />
          )}
        </button>

        {/* Song Info */}
        <div className="flex-shrink-0 min-w-[200px]">
          <p className="text-white font-semibold text-sm truncate">
            Who You Should Be With
          </p>
          <p className="text-white/70 text-xs truncate">Layup</p>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-white/70 text-xs flex-shrink-0">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-white/70 text-xs flex-shrink-0">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-3 py-3 space-y-3">
        {/* Top Row: Song Info and Play Button */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 text-[#223318] rounded-full transition-colors flex-shrink-0 shadow-md"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-[#223318]" />
            ) : (
              <Play className="w-5 h-5 fill-[#223318]" />
            )}
          </button>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-xs truncate">
              Who You Should Be With
            </p>
            <p className="text-white/70 text-xs truncate">Layup</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-white/70 text-xs px-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
