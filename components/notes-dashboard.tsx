"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search, Edit2, Trash2, Plus, FileText, BookOpen, Pin,
  Coffee, Music, Code, Briefcase, Dumbbell, Gamepad2,
  Palette, Target, Zap, Brain, Clock, Calendar,
  TrendingUp, BarChart3, MoreVertical, X, Check,
  Filter, Grid3x3, List, Archive, Copy, PinOff
} from "lucide-react"
import type { Category, Note } from "@/lib/types"

interface NotesDashboardProps {
  categories: Category[]
  userId: string
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Coffee, Music, BookOpen, Code, Briefcase, Dumbbell,
  Gamepad2, Palette, Target, Zap, Brain, Clock, Calendar,
  TrendingUp, BarChart3, FileText
}

const NOTE_COLORS = [
  { name: 'Amber', value: '#fbbf24' },
  { name: 'Rose', value: '#fb7185' },
  { name: 'Emerald', value: '#34d399' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Purple', value: '#a78bfa' },
  { name: 'Orange', value: '#fb923c' },
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Pink', value: '#f472b6' },
]

export function NotesDashboard({ categories, userId }: NotesDashboardProps) {
  const supabase = createClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const autoSaveTimers = useRef<Record<string, NodeJS.Timeout>>({})

  const safeCategories = Array.isArray(categories) ? categories : []

  // Load notes
  useEffect(() => {
    loadNotes()
  }, [userId])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-save function
  const autoSave = async (noteId: string, updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', noteId)

      if (!error) {
        setNotes(prev => prev.map(n =>
          n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
        ))
      }
    } catch (error) {
      console.error('Error auto-saving note:', error)
    }
  }

  // Debounced auto-save
  const scheduleAutoSave = (noteId: string, updates: Partial<Note>) => {
    if (autoSaveTimers.current[noteId]) {
      clearTimeout(autoSaveTimers.current[noteId])
    }

    autoSaveTimers.current[noteId] = setTimeout(() => {
      autoSave(noteId, updates)
    }, 1000) // Auto-save after 1 second of inactivity
  }

  // Create new note
  const createNote = async (categoryId?: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          category_id: categoryId || null,
          title: 'Untitled Note',
          content: '',
          color: NOTE_COLORS[0].value,
          is_pinned: false
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setNotes(prev => [data, ...prev])
        setEditingNote(data)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error('Error creating note:', error)
      alert('Failed to create note')
    }
  }

  // Update note
  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    scheduleAutoSave(noteId, updates)
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates } : n))
  }

  // Delete note
  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (!error) {
        setNotes(prev => prev.filter(n => n.id !== noteId))
        if (editingNote?.id === noteId) {
          setIsModalOpen(false)
          setEditingNote(null)
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note')
    }
  }

  // Toggle pin
  const togglePin = async (noteId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !isPinned })
        .eq('id', noteId)

      if (!error) {
        setNotes(prev => prev.map(n =>
          n.id === noteId ? { ...n, is_pinned: !isPinned } : n
        ).sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        }))
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  // Duplicate note
  const duplicateNote = async (note: Note) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          category_id: note.category_id,
          title: `${note.title} (Copy)`,
          content: note.content,
          color: note.color,
          is_pinned: false
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setNotes(prev => [data, ...prev])
      }
    } catch (error) {
      console.error('Error duplicating note:', error)
      alert('Failed to duplicate note')
    }
  }

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery.trim() === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !filterCategory || note.category_id === filterCategory

    return matchesSearch && matchesCategory
  })

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned)
  const unpinnedNotes = filteredNotes.filter(n => !n.is_pinned)

  const getIcon = (iconName: string) => iconMap[iconName] || FileText

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Notes</h2>
          <p className="text-stone-600">Capture your thoughts and ideas</p>
        </div>
        <Button
          onClick={() => createNote()}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-stone-300 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {filterCategory
                    ? safeCategories.find(c => c.id === filterCategory)?.name
                    : 'All Categories'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterCategory(null)}>
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterCategory('uncategorized')}>
                  Uncategorized
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {safeCategories.map(cat => (
                  <DropdownMenuItem key={cat.id} onClick={() => setFilterCategory(cat.id)}>
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center border border-stone-300 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-stone-100' : ''}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-stone-100' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Create by Category */}
      {safeCategories.length > 0 && (
        <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <p className="text-sm text-stone-600 mb-3">Quick create by category:</p>
          <div className="flex flex-wrap gap-2">
            {safeCategories.map(cat => {
              const Icon = getIcon(cat.icon)
              return (
                <Button
                  key={cat.id}
                  onClick={() => createNote(cat.id)}
                  variant="outline"
                  size="sm"
                  className="border-stone-300 hover:border-amber-400"
                >
                  <Icon className="w-3 h-3 mr-2" style={{ color: cat.color }} />
                  {cat.name}
                </Button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-stone-600 mt-4">Loading notes...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && notes.length === 0 && (
        <Card className="p-12 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
              <FileText className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">No Notes Yet</h3>
            <p className="text-stone-600 mb-6 max-w-md mx-auto">
              Start capturing your ideas, thoughts, and reminders. Create your first note to get started.
            </p>
            <Button
              onClick={() => createNote()}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Note
            </Button>
          </div>
        </Card>
      )}

      {/* Pinned Notes */}
      {!loading && pinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Pin className="w-5 h-5 text-amber-600" />
            Pinned
          </h3>
          <div className={viewMode === 'grid'
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'}>
            {pinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                categories={safeCategories}
                viewMode={viewMode}
                onEdit={() => {
                  setEditingNote(note)
                  setIsModalOpen(true)
                }}
                onDelete={() => deleteNote(note.id)}
                onTogglePin={() => togglePin(note.id, note.is_pinned)}
                onDuplicate={() => duplicateNote(note)}
                onUpdate={updateNote}
                getIcon={getIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes */}
      {!loading && unpinnedNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Other Notes</h3>
          )}
          <div className={viewMode === 'grid'
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'}>
            {unpinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                categories={safeCategories}
                viewMode={viewMode}
                onEdit={() => {
                  setEditingNote(note)
                  setIsModalOpen(true)
                }}
                onDelete={() => deleteNote(note.id)}
                onTogglePin={() => togglePin(note.id, note.is_pinned)}
                onDuplicate={() => duplicateNote(note)}
                onUpdate={updateNote}
                getIcon={getIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <NoteEditModal
        note={editingNote}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingNote(null)
        }}
        onUpdate={updateNote}
        onDelete={deleteNote}
        categories={safeCategories}
        noteColors={NOTE_COLORS}
        getIcon={getIcon}
      />
    </div>
  )
}

// Note Card Component
function NoteCard({
  note,
  categories,
  viewMode,
  onEdit,
  onDelete,
  onTogglePin,
  onDuplicate,
  onUpdate,
  getIcon
}: {
  note: Note
  categories: Category[]
  viewMode: 'grid' | 'list'
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
  onDuplicate: () => void
  onUpdate: (noteId: string, updates: Partial<Note>) => void
  getIcon: (iconName: string) => React.ComponentType<any>
}) {
  const category = categories.find(c => c.id === note.category_id)
  const Icon = category ? getIcon(category.icon) : null
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0

  return (
    <Card
      className="border border-stone-200/50 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden"
      style={{ backgroundColor: `${note.color}15` }}
    >
      <div
        className="h-1 absolute top-0 left-0 right-0"
        style={{ backgroundColor: note.color }}
      />

      {note.is_pinned && (
        <div className="absolute top-3 right-3">
          <Pin className="w-4 h-4 text-amber-600 fill-amber-600" />
        </div>
      )}

      <div className="p-4" onClick={onEdit}>
        {category && (
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${category.color}30`, color: category.color }}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {category.name}
            </div>
          </div>
        )}

        <h3 className="font-bold text-stone-900 mb-2 line-clamp-2">
          {note.title}
        </h3>

        <p className={`text-sm text-stone-600 ${viewMode === 'grid' ? 'line-clamp-4' : 'line-clamp-2'}`}>
          {note.content || 'No content'}
        </p>

        <div className="flex items-center justify-between mt-4 text-xs text-stone-500">
          <span>{wordCount} words</span>
          <span>{new Date(note.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 px-2">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit2 className="w-3 h-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
              {note.is_pinned ? <PinOff className="w-3 h-3 mr-2" /> : <Pin className="w-3 h-3 mr-2" />}
              {note.is_pinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
              <Copy className="w-3 h-3 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-red-600"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}

// Note Edit Modal Component
function NoteEditModal({
  note,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  categories,
  noteColors,
  getIcon
}: {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (noteId: string, updates: Partial<Note>) => void
  onDelete: (noteId: string) => void
  categories: Category[]
  noteColors: { name: string; value: string }[]
  getIcon: (iconName: string) => React.ComponentType<any>
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [color, setColor] = useState('')

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setCategoryId(note.category_id)
      setColor(note.color)
    }
  }, [note])

  if (!note) return null

  const handleUpdate = (updates: Partial<Note>) => {
    onUpdate(note.id, updates)
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Edit Note</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onDelete(note.id)
                  onClose()
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Title */}
          <div>
            <Label className="text-sm font-medium text-stone-700 mb-2 block">
              Title
            </Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                handleUpdate({ title: e.target.value })
              }}
              placeholder="Note title..."
              className="text-lg font-semibold border-stone-300 focus:border-amber-500"
            />
          </div>

          {/* Content */}
          <div>
            <Label className="text-sm font-medium text-stone-700 mb-2 block">
              Content
            </Label>
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                handleUpdate({ content: e.target.value })
              }}
              placeholder="Start writing..."
              className="min-h-[300px] border-stone-300 focus:border-amber-500 resize-none"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
              <span>{wordCount} words, {charCount} characters</span>
              <span className="text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Auto-saved
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium text-stone-700 mb-2 block">
              Category
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={categoryId === null ? "default" : "outline"}
                onClick={() => {
                  setCategoryId(null)
                  handleUpdate({ category_id: null })
                }}
                className={categoryId === null ? "bg-stone-700" : ""}
              >
                No Category
              </Button>
              {categories.map(cat => {
                const Icon = getIcon(cat.icon)
                return (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={categoryId === cat.id ? "default" : "outline"}
                    onClick={() => {
                      setCategoryId(cat.id)
                      handleUpdate({ category_id: cat.id })
                    }}
                    style={categoryId === cat.id ? {
                      backgroundColor: cat.color,
                      borderColor: cat.color
                    } : {}}
                  >
                    <Icon className="w-3 h-3 mr-2" />
                    {cat.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Color */}
          <div>
            <Label className="text-sm font-medium text-stone-700 mb-2 block">
              Color
            </Label>
            <div className="flex gap-3">
              {noteColors.map(c => (
                <button
                  key={c.value}
                  onClick={() => {
                    setColor(c.value)
                    handleUpdate({ color: c.value })
                  }}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    color === c.value
                      ? 'border-stone-900 scale-110'
                      : 'border-stone-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-stone-500">
            Last updated: {new Date(note.updated_at).toLocaleString()}
          </div>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
