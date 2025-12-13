import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Shuffle, Music, FileAudio
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
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none')
  const [isShuffle, setIsShuffle] = useState(false)
  const [playlist, setPlaylist] = useState<MusicTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        imageFile: `${MUSIC_FOLDER}/focus-music-1.jpeg`
      },
      {
        id: '2',
        title: 'Coding Concentration',
        artist: 'Programming Vibes',
        duration: 7200,
        genre: 'Productivity',
        color: '#fb923c',
        audioFile: `${MUSIC_FOLDER}/focus-music-2.mp3`,
        imageFile: `${MUSIC_FOLDER}/focus-music-2.jpeg`
      },
      {
        id: '3',
        title: 'Late Night Focus',
        artist: 'Night Owl Sessions',
        duration: 7200,
        genre: 'Deep Work',
        color: '#f59e0b',
        audioFile: `${MUSIC_FOLDER}/focus-music-3.mp3`,
        imageFile: `${MUSIC_FOLDER}/focus-music-3.jpeg`
      },
      {
        id: '4',
        title: 'Creative Flow State',
        artist: 'Artistic Focus',
        duration: 7200,
        genre: 'Creative',
        color: '#fb923c',
        audioFile: `${MUSIC_FOLDER}/focus-music-4.mp3`,
        imageFile: `${MUSIC_FOLDER}/focus-music-4.jpeg`
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
    } else {
      setIsPlaying(!isPlaying)
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

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

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

  const progressPercentage = currentTrack ? (currentTime / currentTrack.duration) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-8 py-16 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Music className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-6xl font-black text-white mb-2 drop-shadow-lg">Focus Music</h1>
              <p className="text-orange-100 text-lg font-medium">Your ultimate productivity soundtrack</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
          Your Library
          <span className="text-lg font-normal text-gray-500">({playlist.length} tracks)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playlist.map((track, index) => (
            <div
              key={track.id}
              onClick={() => handleTrackSelect(index)}
              className="bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 p-6 rounded-2xl cursor-pointer transition-all duration-300 group shadow-xl hover:shadow-2xl hover:scale-[1.02] border-2 border-transparent hover:border-orange-200 flex gap-6"
            >
              {/* Thumbnail */}
              <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 ring-4 ring-orange-100 group-hover:ring-orange-300 transition-all">
                <img
                  src={track.imageFile}
                  alt={track.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.parentElement
                    if (fallback) {
                      fallback.style.background = 'linear-gradient(135deg, #f97316, #fb923c)'
                      fallback.innerHTML = `
                        <div class="absolute inset-0 flex items-center justify-center">
                          <svg class="w-20 h-20 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                          </svg>
                        </div>
                      `
                    }
                  }}
                />

                {/* Play overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center transition-opacity ${
                  currentTrackIndex === index && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 hover:scale-110 flex items-center justify-center shadow-2xl transition-all">
                    {currentTrackIndex === index && isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </div>
                </div>

                {/* Playing indicator */}
                {currentTrackIndex === index && isPlaying && (
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <div className="w-1.5 h-5 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-7 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-6 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="w-1.5 h-8 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.45s' }} />
                  </div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200">
                      {track.genre}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                    {track.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-3 font-medium">{track.artist}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-orange-500" />
                      <span className="font-mono text-xs">{track.audioFile.split('/').pop()}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-700">
                      {formatTime(track.duration)}
                    </span>
                    {currentTrackIndex === index && (
                      <span className="flex items-center gap-2 text-orange-600 text-sm font-semibold">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        Now Playing
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Player Bar */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t-4 border-orange-500 px-6 py-4 shadow-2xl backdrop-blur-xl">
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-3 items-center gap-6">
              {/* Left - Track Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 ring-2 ring-orange-400">
                  <img src={currentTrack.imageFile} alt={currentTrack.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-base truncate">{currentTrack.title}</p>
                  <p className="text-sm text-gray-300 truncate">{currentTrack.artist}</p>
                  <p className="text-xs text-gray-500 truncate font-mono mt-0.5">{currentTrack.genre}</p>
                </div>
              </div>

              {/* Center - Controls */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 mb-3">
                  <Button
                    onClick={() => setIsShuffle(!isShuffle)}
                    size="icon"
                    variant="ghost"
                    className={`w-9 h-9 rounded-full transition-all ${isShuffle ? 'text-orange-400 bg-orange-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={handlePrevTrack}
                    size="icon"
                    variant="ghost"
                    className="w-9 h-9 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <SkipBack className="w-5 h-5 fill-current" />
                  </Button>

                  <Button
                    onClick={handlePlayPause}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 hover:scale-110 shadow-xl shadow-orange-500/50 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    )}
                  </Button>

                  <Button
                    onClick={handleNextTrack}
                    size="icon"
                    variant="ghost"
                    className="w-9 h-9 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <SkipForward className="w-5 h-5 fill-current" />
                  </Button>

                  <Button
                    onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                    size="icon"
                    variant="ghost"
                    className={`w-9 h-9 rounded-full relative transition-all ${
                      repeatMode !== 'none' ? 'text-orange-400 bg-orange-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                    {repeatMode === 'one' && (
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-black">1</span>
                    )}
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 w-full max-w-2xl">
                  <span className="text-xs text-gray-400 w-12 text-right font-medium">{formatTime(currentTime)}</span>
                  <div
                    className="relative flex-1 h-2 bg-gray-700 rounded-full group cursor-pointer"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all shadow-lg shadow-orange-500/50"
                      style={{ width: `${progressPercentage}%` }}
                    />
                    <div
                      className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-xl transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all ring-2 ring-orange-400"
                      style={{ left: `${progressPercentage}%`, marginLeft: '-8px' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 font-medium">{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Right - Volume */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={handleMuteToggle}
                  size="icon"
                  variant="ghost"
                  className="w-9 h-9 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <div className="relative w-28 h-2 bg-gray-700 rounded-full group cursor-pointer">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all"
                    style={{ width: `${volume}%` }}
                  />
                  <div
                    className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ring-2 ring-orange-400"
                    style={{ left: `${volume}%`, marginLeft: '-6px' }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-10 font-medium">{volume}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
