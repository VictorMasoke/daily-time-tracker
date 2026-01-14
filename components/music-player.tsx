"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Music, Grid3x3, List, Maximize2,
  ChevronDown, ChevronUp, ListMusic, Disc3, Heart,
  Clock, TrendingUp, Waves, Sparkles, Radio
} from "lucide-react"

interface MusicTrack {
  id: string
  title: string
  artist: string
  duration: number
  genre: string
  color: string
  audioFile: string
  imageFile: string
  plays?: number
  liked?: boolean
}


interface MusicPlayerProps {
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onPlayingChange?: (playing: boolean) => void
}

// Animated equalizer bars component
function EqualizerBars({ isPlaying, color = "white", size = "md" }: { isPlaying: boolean, color?: string, size?: "sm" | "md" | "lg" }) {
  const barCount = size === "sm" ? 3 : size === "md" ? 4 : 5
  const heights = size === "sm" ? [8, 12, 8] : size === "md" ? [12, 20, 16, 12] : [16, 24, 20, 28, 16]
  const barWidth = size === "sm" ? 2 : size === "md" ? 3 : 4

  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: barWidth,
            backgroundColor: color === "white" ? "white" : color,
          }}
          animate={isPlaying ? {
            height: [heights[i], heights[i] * 0.4, heights[i], heights[i] * 0.6, heights[i]],
          } : { height: 4 }}
          transition={{
            duration: 0.8,
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Animated vinyl record component
function VinylRecord({ imageUrl, isPlaying, size = 192 }: { imageUrl: string, isPlaying: boolean, size?: number }) {
  return (
    <motion.div
      className="relative rounded-full overflow-hidden shadow-2xl"
      style={{ width: size, height: size }}
      animate={{ rotate: isPlaying ? 360 : 0 }}
      transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
    >
      {/* Vinyl grooves */}
      <div className="absolute inset-0 rounded-full" style={{
        background: `repeating-radial-gradient(
          circle at center,
          transparent 0px,
          transparent 2px,
          rgba(0,0,0,0.1) 2px,
          rgba(0,0,0,0.1) 4px
        )`
      }} />

      {/* Album art center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-full overflow-hidden ring-4 ring-black/20"
          style={{ width: size * 0.6, height: size * 0.6 }}
        >
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Center hole */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900"
        style={{ width: size * 0.08, height: size * 0.08 }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)"
        }}
        animate={isPlaying ? { opacity: [0.5, 0.8, 0.5] } : { opacity: 0.5 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}

// Audio waveform visualization
function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
  const bars = 40

  return (
    <div className="flex items-center justify-center gap-[2px] h-12 overflow-hidden">
      {Array.from({ length: bars }).map((_, i) => {
        const centerDistance = Math.abs(i - bars / 2) / (bars / 2)
        const maxHeight = 48 * (1 - centerDistance * 0.5)

        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-amber-500 to-orange-400"
            animate={isPlaying ? {
              height: [
                maxHeight * 0.3,
                maxHeight,
                maxHeight * 0.5,
                maxHeight * 0.8,
                maxHeight * 0.3
              ]
            } : { height: 4 }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              repeat: isPlaying ? Infinity : 0,
              delay: i * 0.02,
              ease: "easeInOut"
            }}
          />
        )
      })}
    </div>
  )
}

export default function MusicPlayer({ isMinimized = false, onToggleMinimize, onPlayingChange }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none')
  const [isShuffle, setIsShuffle] = useState(false)
  const [playlist, setPlaylist] = useState<MusicTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid')
  const [showPlaylist, setShowPlaylist] = useState(true)
  const [visualizerMode, setVisualizerMode] = useState<'vinyl' | 'waveform'>('vinyl')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null

  const MUSIC_FOLDER = "/music"

  useEffect(() => {
    const mockTracks: MusicTrack[] = [
      {
        id: '1',
        title: 'Deep Focus Flow',
        artist: 'Focus Beats',
        duration: 7200,
        genre: 'Focus',
        color: '#f97316',
        audioFile: `${MUSIC_FOLDER}/focus-music-1.mp3`,
        imageFile: `${MUSIC_FOLDER}/focus-music-1.jpeg`,
        plays: 1234,
        liked: true
      },
      {
        id: '2',
        title: 'Coding Concentration',
        artist: 'Programming Vibes',
        duration: 7200,
        genre: 'Productivity',
        color: '#fb923c',
        audioFile: `${MUSIC_FOLDER}/focus-music-2.mp3`,
        imageFile: `${MUSIC_FOLDER}/focus-music-2.jpeg`,
        plays: 987,
        liked: false
      },
      {
        id: '3',
        title: 'Late Night Focus',
        artist: 'Night Owl Sessions',
        duration: 7200,
        genre: 'Deep Work',
        color: '#f59e0b',
        audioFile: `${MUSIC_FOLDER}/focus-music-3.mp3`,
        imageFile: `${MUSIC_FOLDER}/focus-music-3.jpeg`,
        plays: 2341,
        liked: true
      },
      {
        id: '4',
        title: 'Creative Flow State',
        artist: 'Artistic Focus',
        duration: 7200,
        genre: 'Creative',
        color: '#fb923c',
        audioFile: `${MUSIC_FOLDER}/focus-music-4.mp3`,
        imageFile: `${MUSIC_FOLDER}/focus-music-4.jpeg`,
        plays: 876,
        liked: false
      }
    ]

    setPlaylist(mockTracks)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(Math.floor(audioRef.current.currentTime))
        }
      })
      audioRef.current.addEventListener('ended', handleAudioEnded)

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleAudioEnded)
          audioRef.current.pause()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audioFile
      audioRef.current.load()
      if (isPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentTrack])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(console.error)
      startProgressTimer()
    } else {
      audioRef.current.pause()
      stopProgressTimer()
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  const handleAudioEnded = () => {
    if (repeatMode === 'one' && currentTrack) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(console.error)
      }
      setCurrentTime(0)
    } else {
      handleNextTrack()
    }
  }

  const startProgressTimer = () => {
    stopProgressTimer()
    intervalRef.current = setInterval(() => {
      if (audioRef.current && currentTrack) {
        const newTime = Math.floor(audioRef.current.currentTime)
        setCurrentTime(newTime)
        if (newTime >= currentTrack.duration) {
          handleAudioEnded()
        }
      }
    }, 1000)
  }

  const stopProgressTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (currentTrackIndex === null && playlist.length > 0) {
      setCurrentTrackIndex(0)
      setIsPlaying(true)
      onPlayingChange?.(true)
    } else {
      const newState = !isPlaying
      setIsPlaying(newState)
      onPlayingChange?.(newState)
    }
  }

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const handleNextTrack = () => {
    if (currentTrackIndex === null || playlist.length === 0) return
    let nextIndex: number
    if (isShuffle) {
      let randomIndex
      do {
        randomIndex = Math.floor(Math.random() * playlist.length)
      } while (randomIndex === currentTrackIndex && playlist.length > 1)
      nextIndex = randomIndex
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length
    }
    setCurrentTrackIndex(nextIndex)
    setCurrentTime(0)
  }

  const handlePrevTrack = () => {
    if (currentTrackIndex === null || playlist.length === 0) return
    if (currentTime > 5) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
      setCurrentTime(0)
    } else {
      const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length
      setCurrentTrackIndex(prevIndex)
      setCurrentTime(0)
    }
  }

  const handleMuteToggle = () => setIsMuted(!isMuted)

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack || !audioRef.current) return
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const progressBarWidth = progressBar.clientWidth
    const percentage = clickPosition / progressBarWidth
    const newTime = percentage * currentTrack.duration
    audioRef.current.currentTime = newTime
    setCurrentTime(Math.floor(newTime))
  }

  const toggleLike = (trackId: string) => {
    setPlaylist(prev => prev.map(t =>
      t.id === trackId ? { ...t, liked: !t.liked } : t
    ))
  }

  const progressPercentage = currentTrack ? (currentTime / currentTrack.duration) * 100 : 0

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <div className="text-center">
          <motion.div
            className="relative w-24 h-24 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
            <div className="absolute inset-2 rounded-full bg-white dark:bg-stone-900 flex items-center justify-center">
              <Music className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>
          <p className="text-stone-700 dark:text-stone-300 text-xl font-semibold">Loading your music...</p>
        </div>
      </motion.div>
    )
  }


  return (
    <>
      <div style={{ display: isMinimized ? 'none' : 'block' }}>
        <div className="space-y-6">
          {/* Header with Now Playing */}
          <AnimatePresence mode="wait">
            {currentTrack ? (
              <motion.div
                key="now-playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden rounded-3xl"
              >
                <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 dark:from-black dark:via-stone-900 dark:to-black p-8 shadow-2xl">
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 opacity-40"
                    animate={{
                      background: [
                        `radial-gradient(circle at 20% 20%, ${currentTrack.color}40 0%, transparent 50%)`,
                        `radial-gradient(circle at 80% 80%, ${currentTrack.color}40 0%, transparent 50%)`,
                        `radial-gradient(circle at 50% 50%, ${currentTrack.color}40 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 20%, ${currentTrack.color}40 0%, transparent 50%)`,
                      ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Floating particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-amber-400/30"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -30, 0],
                          opacity: [0.2, 0.6, 0.2],
                          scale: [1, 1.5, 1]
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                      {/* Album Art / Vinyl */}
                      <div className="relative flex-shrink-0">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                          {visualizerMode === 'vinyl' ? (
                            <VinylRecord
                              imageUrl={currentTrack.imageFile}
                              isPlaying={isPlaying}
                              size={220}
                            />
                          ) : (
                            <div className="relative w-[220px] h-[220px] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                              <img
                                src={currentTrack.imageFile}
                                alt={currentTrack.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <AudioWaveform isPlaying={isPlaying} />
                              </div>
                            </div>
                          )}
                        </motion.div>

                        {/* Visualizer mode toggle */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setVisualizerMode(v => v === 'vinyl' ? 'waveform' : 'vinyl')}
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium flex items-center gap-1.5 hover:bg-white/20 transition-colors"
                        >
                          {visualizerMode === 'vinyl' ? (
                            <><Waves className="w-3 h-3" /> Waveform</>
                          ) : (
                            <><Disc3 className="w-3 h-3" /> Vinyl</>
                          )}
                        </motion.button>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 text-white text-center lg:text-left">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center justify-center lg:justify-start gap-2 mb-3"
                        >
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30">
                            <Radio className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                              Now Playing
                            </span>
                            {isPlaying && (
                              <EqualizerBars isPlaying={isPlaying} color="#fbbf24" size="sm" />
                            )}
                          </div>
                        </motion.div>

                        <motion.h2
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent"
                        >
                          {currentTrack.title}
                        </motion.h2>

                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-lg lg:text-xl text-stone-400 mb-4"
                        >
                          {currentTrack.artist}
                        </motion.p>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6"
                        >
                          <span
                            className="px-4 py-1.5 rounded-full text-sm font-semibold"
                            style={{
                              backgroundColor: `${currentTrack.color}30`,
                              color: currentTrack.color,
                              boxShadow: `0 0 20px ${currentTrack.color}20`
                            }}
                          >
                            {currentTrack.genre}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-stone-400">
                            <TrendingUp className="w-4 h-4" />
                            {currentTrack.plays?.toLocaleString()} plays
                          </span>
                          <span className="flex items-center gap-2 text-sm text-stone-400">
                            <Clock className="w-4 h-4" />
                            {formatTime(currentTrack.duration)}
                          </span>
                        </motion.div>

                        {/* Progress Bar */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mb-6"
                        >
                          <div
                            className="relative h-2 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
                            onClick={handleProgressClick}
                          >
                            {/* Glow effect */}
                            <motion.div
                              className="absolute top-0 left-0 h-full rounded-full"
                              style={{
                                width: `${progressPercentage}%`,
                                background: `linear-gradient(90deg, ${currentTrack.color}, #fbbf24)`,
                                boxShadow: `0 0 20px ${currentTrack.color}80`
                              }}
                            />
                            <motion.div
                              className="absolute top-1/2 w-4 h-4 rounded-full bg-white shadow-xl transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ left: `${progressPercentage}%`, marginLeft: '-8px' }}
                              whileHover={{ scale: 1.2 }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm mt-2 text-stone-400">
                            <span className="font-mono">{formatTime(currentTime)}</span>
                            <span className="font-mono">{formatTime(currentTrack.duration)}</span>
                          </div>
                        </motion.div>

                        {/* Main Controls */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex items-center justify-center lg:justify-start gap-2"
                        >
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => toggleLike(currentTrack.id)}
                              size="icon"
                              variant="ghost"
                              className={`h-11 w-11 rounded-full transition-all ${
                                currentTrack.liked
                                  ? 'text-red-400 bg-red-500/20'
                                  : 'text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${currentTrack.liked ? 'fill-current' : ''}`} />
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => setIsShuffle(!isShuffle)}
                              size="icon"
                              variant="ghost"
                              className={`h-11 w-11 rounded-full transition-all ${
                                isShuffle ? 'text-amber-400 bg-amber-500/20' : 'text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <Shuffle className="w-4 h-4" />
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={handlePrevTrack}
                              size="icon"
                              variant="ghost"
                              className="h-12 w-12 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                            >
                              <SkipBack className="w-5 h-5 fill-current" />
                            </Button>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={handlePlayPause}
                              className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-2xl shadow-orange-500/30"
                            >
                              <AnimatePresence mode="wait">
                                {isPlaying ? (
                                  <motion.div
                                    key="pause"
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 90 }}
                                  >
                                    <Pause className="w-7 h-7" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="play"
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 90 }}
                                  >
                                    <Play className="w-7 h-7 ml-1" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={handleNextTrack}
                              size="icon"
                              variant="ghost"
                              className="h-12 w-12 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                            >
                              <SkipForward className="w-5 h-5 fill-current" />
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => setRepeatMode(
                                repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none'
                              )}
                              size="icon"
                              variant="ghost"
                              className={`h-11 w-11 rounded-full relative transition-all ${
                                repeatMode !== 'none' ? 'text-amber-400 bg-amber-500/20' : 'text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <Repeat className="w-4 h-4" />
                              {repeatMode === 'one' && (
                                <span className="absolute text-[9px] font-black">1</span>
                              )}
                            </Button>
                          </motion.div>

                          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={handleMuteToggle}
                                size="icon"
                                variant="ghost"
                                className="h-11 w-11 rounded-full text-white/60 hover:text-white hover:bg-white/10"
                              >
                                {isMuted || volume === 0 ? (
                                  <VolumeX className="w-5 h-5" />
                                ) : (
                                  <Volume2 className="w-5 h-5" />
                                )}
                              </Button>
                            </motion.div>
                            <div className="relative w-24 h-2 bg-white/10 rounded-full group">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                style={{ width: `${volume}%` }}
                              />
                              <div
                                className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `${volume}%`, marginLeft: '-6px' }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-track"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-16 border border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-stone-800 dark:to-stone-900">
                  <div className="text-center">
                    <motion.div
                      className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-6"
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Music className="w-12 h-12 text-orange-600 dark:text-orange-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Select a track to play</h3>
                    <p className="text-stone-600 dark:text-stone-400">Choose from your focus music library below</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playlist Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 border border-stone-200/50 dark:border-stone-700/50 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    variant="ghost"
                    className="flex items-center gap-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                  >
                    <motion.div
                      animate={{ rotate: showPlaylist ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {showPlaylist ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.div>
                    <ListMusic className="w-5 h-5" />
                    <span className="font-semibold">Your Library</span>
                    <span className="text-sm text-stone-500 dark:text-stone-400">({playlist.length} tracks)</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-600 dark:text-stone-400 mr-2">View:</span>
                  <div className="flex items-center border border-stone-300 dark:border-stone-600 rounded-lg overflow-hidden">
                    {[
                      { mode: 'grid' as const, icon: Grid3x3 },
                      { mode: 'compact' as const, icon: Disc3 },
                      { mode: 'list' as const, icon: List }
                    ].map(({ mode, icon: Icon }) => (
                      <Button
                        key={mode}
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode(mode)}
                        className={`rounded-none border-0 ${
                          viewMode === mode
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Playlist */}
          <AnimatePresence>
            {showPlaylist && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === 'grid' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlist.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card
                          className={`border border-stone-200/50 dark:border-stone-700/50 hover:shadow-xl transition-all cursor-pointer group overflow-hidden ${
                            currentTrackIndex === index
                              ? 'ring-2 ring-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                              : 'bg-white/80 dark:bg-stone-800/80'
                          }`}
                          onClick={() => handleTrackSelect(index)}
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={track.imageFile}
                              alt={track.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-center justify-center transition-opacity ${
                              currentTrackIndex === index && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <motion.div
                                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {currentTrackIndex === index && isPlaying ? (
                                  <Pause className="w-8 h-8 text-amber-600" />
                                ) : (
                                  <Play className="w-8 h-8 text-amber-600 ml-1" />
                                )}
                              </motion.div>
                            </div>

                            {currentTrackIndex === index && isPlaying && (
                              <div className="absolute bottom-4 right-4">
                                <EqualizerBars isPlaying={isPlaying} color="white" size="md" />
                              </div>
                            )}

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLike(track.id)
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                track.liked
                                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                  : 'bg-white/90 text-stone-600 hover:bg-white'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${track.liked ? 'fill-current' : ''}`} />
                            </motion.button>
                          </div>

                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: `${track.color}20`, color: track.color }}
                              >
                                {track.genre}
                              </span>
                              {currentTrackIndex === index && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Playing
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1 line-clamp-1">
                              {track.title}
                            </h3>
                            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">{track.artist}</p>
                            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(track.duration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {track.plays}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {viewMode === 'compact' && (
                  <div className="grid md:grid-cols-2 gap-3">
                    {playlist.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                      >
                        <Card
                          className={`border border-stone-200/50 dark:border-stone-700/50 hover:shadow-lg transition-all cursor-pointer group ${
                            currentTrackIndex === index
                              ? 'ring-2 ring-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                              : 'bg-white/80 dark:bg-stone-800/80'
                          }`}
                          onClick={() => handleTrackSelect(index)}
                        >
                          <div className="p-3 flex items-center gap-3">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                              <img src={track.imageFile} alt={track.title} className="w-full h-full object-cover" />
                              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                                currentTrackIndex === index && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                  {currentTrackIndex === index && isPlaying ? (
                                    <Pause className="w-5 h-5 text-amber-600" />
                                  ) : (
                                    <Play className="w-5 h-5 text-amber-600 ml-0.5" />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-stone-900 dark:text-white truncate">{track.title}</h3>
                                {currentTrackIndex === index && isPlaying && (
                                  <EqualizerBars isPlaying={isPlaying} color="#f59e0b" size="sm" />
                                )}
                              </div>
                              <p className="text-sm text-stone-600 dark:text-stone-400 truncate mb-1">{track.artist}</p>
                              <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-500">
                                <span
                                  className="px-2 py-0.5 rounded-full font-medium"
                                  style={{ backgroundColor: `${track.color}20`, color: track.color }}
                                >
                                  {track.genre}
                                </span>
                                <span>{formatTime(track.duration)}</span>
                              </div>
                            </div>

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLike(track.id)
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                track.liked
                                  ? 'text-red-500'
                                  : 'text-stone-400 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${track.liked ? 'fill-current' : ''}`} />
                            </motion.button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <Card className="border border-stone-200/50 dark:border-stone-700/50 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm overflow-hidden">
                    <div className="divide-y divide-stone-200 dark:divide-stone-700">
                      {playlist.map((track, index) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(251, 191, 36, 0.05)" }}
                          className={`p-4 transition-all cursor-pointer group ${
                            currentTrackIndex === index
                              ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                              : ''
                          }`}
                          onClick={() => handleTrackSelect(index)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 text-center text-stone-500 dark:text-stone-400 font-medium">
                              {currentTrackIndex === index && isPlaying ? (
                                <EqualizerBars isPlaying={isPlaying} color="#f59e0b" size="sm" />
                              ) : (
                                <span className="text-sm">{index + 1}</span>
                              )}
                            </div>

                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow flex-shrink-0">
                              <img src={track.imageFile} alt={track.title} className="w-full h-full object-cover" />
                              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                                currentTrackIndex === index && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                {currentTrackIndex === index && isPlaying ? (
                                  <Pause className="w-5 h-5 text-white" />
                                ) : (
                                  <Play className="w-5 h-5 text-white ml-0.5" />
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold truncate ${
                                currentTrackIndex === index ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-white'
                              }`}>
                                {track.title}
                              </h3>
                              <p className="text-sm text-stone-600 dark:text-stone-400 truncate">{track.artist}</p>
                            </div>

                            <div className="hidden md:block">
                              <span
                                className="text-xs font-bold px-3 py-1 rounded-full"
                                style={{ backgroundColor: `${track.color}20`, color: track.color }}
                              >
                                {track.genre}
                              </span>
                            </div>

                            <div className="hidden sm:flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                              <TrendingUp className="w-3 h-3" />
                              <span>{track.plays}</span>
                            </div>

                            <div className="text-sm text-stone-600 dark:text-stone-400 font-mono w-16 text-right">
                              {formatTime(track.duration)}
                            </div>

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLike(track.id)
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                track.liked
                                  ? 'text-red-500'
                                  : 'text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${track.liked ? 'fill-current' : ''}`} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Minimized Floating Player */}
      <AnimatePresence>
        {isMinimized && currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white shadow-2xl border-0 z-50 overflow-hidden rounded-2xl">
              <div className="relative">
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      `radial-gradient(circle at 20% 20%, ${currentTrack.color}40 0%, transparent 50%)`,
                      `radial-gradient(circle at 80% 80%, ${currentTrack.color}40 0%, transparent 50%)`,
                      `radial-gradient(circle at 20% 20%, ${currentTrack.color}40 0%, transparent 50%)`,
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isPlaying && <EqualizerBars isPlaying={isPlaying} color="#fbbf24" size="sm" />}
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Now Playing</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={onToggleMinimize}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className="w-14 h-14 rounded-xl overflow-hidden shadow-lg flex-shrink-0 ring-2 ring-white/10"
                      animate={isPlaying ? { rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <img src={currentTrack.imageFile} alt={currentTrack.title} className="w-full h-full object-cover" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{currentTrack.title}</p>
                      <p className="text-xs text-stone-400 truncate">{currentTrack.artist}</p>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mb-3">
                    <div
                      className="relative h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
                      onClick={handleProgressClick}
                    >
                      <motion.div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{
                          width: `${progressPercentage}%`,
                          background: `linear-gradient(90deg, ${currentTrack.color}, #fbbf24)`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1 text-stone-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(currentTrack.duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handlePrevTrack}
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                      >
                        <SkipBack className="w-4 h-4 fill-current" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handlePlayPause}
                        className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleNextTrack}
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                      >
                        <SkipForward className="w-4 h-4 fill-current" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>

  )
}
