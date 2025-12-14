"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Music, FileAudio, Grid3x3, List,
  Maximize2, Minimize2, X, ChevronDown, ChevronUp,
  ListMusic, Disc3, Radio, Heart, Clock, TrendingUp
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
  onPlayingChange?: (playing: boolean) => void  // Add this
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
      onPlayingChange?.(true)  // Add this
    } else {
      const newState = !isPlaying
      setIsPlaying(newState)
      onPlayingChange?.(newState)  // Add this
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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 animate-pulse"></div>
            <Music className="absolute inset-0 w-12 h-12 text-white m-auto animate-bounce" />
          </div>
          <p className="text-gray-700 text-xl font-semibold">Loading your music...</p>
        </div>
      </div>
    )
  }


  return (
    <>
      <div style={{ display: isMinimized ? 'none' : 'block' }}>
        <div className="space-y-6">
          {/* Header with Now Playing */}
          <div className="relative overflow-hidden rounded-2xl">
            {currentTrack ? (
              <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-8 shadow-xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>

                <div className="relative">
                  <div className="flex items-start gap-6">
                    {/* Album Art */}
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 ring-4 ring-white/30">
                      <img src={currentTrack.imageFile} alt={currentTrack.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                      {/* Playing indicator */}
                      {isPlaying && (
                        <div className="absolute bottom-4 left-4 flex gap-1">
                          {[0, 0.15, 0.3, 0.45].map((delay, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-white rounded-full animate-pulse"
                              style={{
                                height: `${20 + Math.random() * 20}px`,
                                animationDelay: `${delay}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Radio className="w-4 h-4" />
                        <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                          Now Playing
                        </span>
                      </div>
                      <h2 className="text-4xl font-black mb-2 drop-shadow-lg">{currentTrack.title}</h2>
                      <p className="text-xl opacity-90 mb-4">{currentTrack.artist}</p>

                      <div className="flex items-center gap-4 mb-6">
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                          {currentTrack.genre}
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          {currentTrack.plays?.toLocaleString()} plays
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div
                          className="relative h-2 bg-white/30 rounded-full cursor-pointer group"
                          onClick={handleProgressClick}
                        >
                          <div
                            className="absolute top-0 left-0 h-full bg-white rounded-full shadow-lg transition-all"
                            style={{ width: `${progressPercentage}%` }}
                          />
                          <div
                            className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-xl transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all"
                            style={{ left: `${progressPercentage}%`, marginLeft: '-8px' }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2 opacity-90">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(currentTrack.duration)}</span>
                        </div>
                      </div>

                      {/* Main Controls */}
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => toggleLike(currentTrack.id)}
                          size="icon"
                          variant="ghost"
                          className={`h-10 w-10 rounded-full transition-all ${
                            currentTrack.liked
                              ? 'text-red-400 bg-white/20'
                              : 'text-white hover:bg-white/20'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${currentTrack.liked ? 'fill-current' : ''}`} />
                        </Button>

                        <Button
                          onClick={() => setIsShuffle(!isShuffle)}
                          size="icon"
                          variant="ghost"
                          className={`h-10 w-10 rounded-full transition-all ${
                            isShuffle ? 'bg-white/20' : 'hover:bg-white/20'
                          }`}
                        >
                          <Shuffle className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={handlePrevTrack}
                          size="icon"
                          variant="ghost"
                          className="h-12 w-12 rounded-full hover:bg-white/20"
                        >
                          <SkipBack className="w-5 h-5 fill-current" />
                        </Button>

                        <Button
                          onClick={handlePlayPause}
                          className="h-16 w-16 rounded-full bg-white text-orange-600 hover:bg-white/90 shadow-2xl hover:scale-105 transition-all"
                        >
                          {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                        </Button>

                        <Button
                          onClick={handleNextTrack}
                          size="icon"
                          variant="ghost"
                          className="h-12 w-12 rounded-full hover:bg-white/20"
                        >
                          <SkipForward className="w-5 h-5 fill-current" />
                        </Button>

                        <Button
                          onClick={() => setRepeatMode(
                            repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none'
                          )}
                          size="icon"
                          variant="ghost"
                          className={`h-10 w-10 rounded-full relative transition-all ${
                            repeatMode !== 'none' ? 'bg-white/20' : 'hover:bg-white/20'
                          }`}
                        >
                          <Repeat className="w-4 h-4" />
                          {repeatMode === 'one' && (
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black">
                              1
                            </span>
                          )}
                        </Button>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            onClick={handleMuteToggle}
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full hover:bg-white/20"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </Button>
                          <div className="relative w-24 h-2 bg-white/30 rounded-full group">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                              className="absolute top-0 left-0 h-full bg-white rounded-full"
                              style={{ width: `${volume}%` }}
                            />
                            <div
                              className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ left: `${volume}%`, marginLeft: '-6px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="p-12 border border-stone-200/50 bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
                    <Music className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-2">Select a track to play</h3>
                  <p className="text-stone-600">Choose from your library below</p>
                </div>
              </Card>
            )}
          </div>

          {/* Playlist Controls */}
          <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  {showPlaylist ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <ListMusic className="w-5 h-5" />
                  <span className="font-semibold">Your Library</span>
                  <span className="text-sm text-stone-500">({playlist.length} tracks)</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-600 mr-2">View:</span>
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-r-none ${viewMode === 'grid' ? 'bg-stone-100' : ''}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('compact')}
                    className={`rounded-none border-x border-stone-300 ${viewMode === 'compact' ? 'bg-stone-100' : ''}`}
                  >
                    <Disc3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-l-none ${viewMode === 'list' ? 'bg-stone-100' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Playlist */}
          {showPlaylist && (
            <>
              {viewMode === 'grid' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlist.map((track, index) => (
                    <Card
                      key={track.id}
                      className={`border border-stone-200/50 hover:shadow-lg transition-all cursor-pointer group overflow-hidden ${
                        currentTrackIndex === index ? 'ring-2 ring-orange-400 bg-gradient-to-br from-orange-50 to-amber-50' : 'bg-white/50'
                      }`}
                      onClick={() => handleTrackSelect(index)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={track.imageFile}
                          alt={track.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center transition-opacity ${
                          currentTrackIndex === index && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl">
                            {currentTrackIndex === index && isPlaying ? (
                              <Pause className="w-8 h-8 text-orange-600" />
                            ) : (
                              <Play className="w-8 h-8 text-orange-600 ml-1" />
                            )}
                          </div>
                        </div>

                        {currentTrackIndex === index && isPlaying && (
                          <div className="absolute bottom-3 right-3 flex gap-1">
                            {[0, 0.15, 0.3, 0.45].map((delay, i) => (
                              <div
                                key={i}
                                className="w-1 bg-white rounded-full animate-pulse"
                                style={{
                                  height: `${16 + Math.random() * 12}px`,
                                  animationDelay: `${delay}s`
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(track.id)
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            track.liked
                              ? 'bg-red-500 text-white'
                              : 'bg-white/80 text-stone-600 hover:bg-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${track.liked ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${track.color}20`, color: track.color }}
                          >
                            {track.genre}
                          </span>
                          {currentTrackIndex === index && (
                            <span className="text-xs text-orange-600 font-semibold flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                              Playing
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-stone-900 mb-1 line-clamp-1">
                          {track.title}
                        </h3>
                        <p className="text-sm text-stone-600 mb-3">{track.artist}</p>
                        <div className="flex items-center justify-between text-xs text-stone-500">
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
                  ))}
                </div>
              )}

              {viewMode === 'compact' && (
                <div className="grid md:grid-cols-2 gap-3">
                  {playlist.map((track, index) => (
                    <Card
                      key={track.id}
                      className={`border border-stone-200/50 hover:shadow-md transition-all cursor-pointer group ${
                        currentTrackIndex === index ? 'ring-2 ring-orange-400 bg-gradient-to-r from-orange-50 to-amber-50' : 'bg-white/50'
                      }`}
                      onClick={() => handleTrackSelect(index)}
                    >
                      <div className="p-3 flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow">
                          <img src={track.imageFile} alt={track.title} className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                            currentTrackIndex === index && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                              {currentTrackIndex === index && isPlaying ? (
                                <Pause className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Play className="w-4 h-4 text-orange-600 ml-0.5" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-stone-900 truncate">{track.title}</h3>
                            {currentTrackIndex === index && isPlaying && (
                              <div className="flex gap-0.5">
                                {[0, 0.15, 0.3].map((delay, i) => (
                                  <div
                                    key={i}
                                    className="w-0.5 bg-orange-500 rounded-full animate-pulse"
                                    style={{
                                      height: `${8 + Math.random() * 6}px`,
                                      animationDelay: `${delay}s`
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-stone-600 truncate mb-1">{track.artist}</p>
                          <div className="flex items-center gap-3 text-xs text-stone-500">
                            <span
                              className="px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${track.color}20`, color: track.color }}
                            >
                              {track.genre}
                            </span>
                            <span>{formatTime(track.duration)}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(track.id)
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            track.liked
                              ? 'text-red-500'
                              : 'text-stone-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${track.liked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <Card className="border border-stone-200/50 bg-white/50 backdrop-blur-sm overflow-hidden">
                  <div className="divide-y divide-stone-200">
                    {playlist.map((track, index) => (
                      <div
                        key={track.id}
                        className={`p-4 hover:bg-stone-50 transition-all cursor-pointer group ${
                          currentTrackIndex === index ? 'bg-gradient-to-r from-orange-50 to-amber-50' : ''
                        }`}
                        onClick={() => handleTrackSelect(index)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 text-center text-stone-500 font-medium">
                            {currentTrackIndex === index && isPlaying ? (
                              <div className="flex gap-0.5 justify-center">
                                {[0, 0.15, 0.3].map((delay, i) => (
                                  <div
                                    key={i}
                                    className="w-0.5 bg-orange-500 rounded-full animate-pulse"
                                    style={{
                                      height: `${10 + Math.random() * 8}px`,
                                      animationDelay: `${delay}s`
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm">{index + 1}</span>
                            )}
                          </div>

                          <div className="relative w-12 h-12 rounded overflow-hidden shadow flex-shrink-0">
                            <img src={track.imageFile} alt={track.title} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
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
                              currentTrackIndex === index ? 'text-orange-600' : 'text-stone-900'
                            }`}>
                              {track.title}
                            </h3>
                            <p className="text-sm text-stone-600 truncate">{track.artist}</p>
                          </div>

                          <div className="hidden md:block">
                            <span
                              className="text-xs font-bold px-3 py-1 rounded-full"
                              style={{ backgroundColor: `${track.color}20`, color: track.color }}
                            >
                              {track.genre}
                            </span>
                          </div>

                          <div className="hidden sm:flex items-center gap-2 text-sm text-stone-500">
                            <TrendingUp className="w-3 h-3" />
                            <span>{track.plays}</span>
                          </div>

                          <div className="text-sm text-stone-600 font-mono w-16 text-right">
                            {formatTime(track.duration)}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLike(track.id)
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              track.liked
                                ? 'text-red-500'
                                : 'text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${track.liked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Minimized Floating Player */}
      {isMinimized && currentTrack && (
        <Card className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-2xl border-0 z-50 overflow-hidden">
          <div className="relative">
            {/* Background image with overlay */}
            <div className="absolute inset-0 opacity-20">
              <img src={currentTrack.imageFile} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Now Playing</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={onToggleMinimize}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                  <img src={currentTrack.imageFile} alt={currentTrack.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{currentTrack.title}</p>
                  <p className="text-xs opacity-90 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mb-3">
                <div
                  className="relative h-1.5 bg-white/30 rounded-full cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs mt-1 opacity-75">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={handlePrevTrack}
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </Button>
                <Button
                  onClick={handlePlayPause}
                  className="h-11 w-11 rounded-full bg-white text-orange-600 hover:bg-white/90 shadow-lg"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button
                  onClick={handleNextTrack}
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>

  )
}
