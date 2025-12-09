// components/notes-dashboard.tsx
"use client"
import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Search, Edit2, Save, X, Plus, FileText, BookOpen,
  Coffee, Music, Code, Briefcase, Dumbbell, Gamepad2,
  Palette, Target, Zap, Brain, Clock, Calendar,
  TrendingUp, BarChart3
} from "lucide-react"
import type { Category } from "@/lib/types"

interface NotesDashboardProps {
  categories: Category[]
  notes: Record<string, string>
  onUpdateNote: (categoryId: string, content: string) => void
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  Coffee, Music, BookOpen: BookOpen, Code, Briefcase, Dumbbell,
  Gamepad2, Palette, Target, Zap, Brain, Clock, Calendar,
  TrendingUp, BarChart3, FileText
}

export function NotesDashboard({ categories, notes, onUpdateNote }: NotesDashboardProps) {
  const safeCategories = Array.isArray(categories) ? categories : []
  const safeNotes = notes || {}
  const [quickNote, setQuickNote] = React.useState('')

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || FileText
  }

  const handleSaveQuickNote = () => {
    if (quickNote.trim()) {
      // Save to localStorage or backend
      const existingQuickNotes = localStorage.getItem('coffee-time-quick-notes')
      const quickNotes = existingQuickNotes ? JSON.parse(existingQuickNotes) : []
      quickNotes.push({
        id: Date.now(),
        content: quickNote,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('coffee-time-quick-notes', JSON.stringify(quickNotes))
      setQuickNote('')
      alert('Quick note saved!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Notes Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Category Notes</h2>
        <p className="text-stone-600">Keep notes and ideas organized by category</p>
      </div>

      {/* Empty State */}
      {safeCategories.length === 0 && (
        <Card className="p-12 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
              <FileText className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">No Categories Yet</h3>
            <p className="text-stone-600 mb-6 max-w-md mx-auto">
              Create categories to organize your notes and keep track of ideas for different areas of your work.
            </p>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Category
            </Button>
          </div>
        </Card>
      )}

      {/* Notes Grid */}
      {safeCategories.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeCategories.map(category => {
            const noteContent = safeNotes[category.id] || ''
            const Icon = getIcon(category.icon)
            const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0

            return (
              <Card
                key={category.id}
                className="border border-stone-200/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow group"
              >
                <div
                  className="h-2 rounded-t-lg"
                  style={{ backgroundColor: category.color }}
                />

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900">{category.name}</h3>
                        <p className="text-xs text-stone-500">
                          {wordCount > 0 ? `${wordCount} word${wordCount !== 1 ? 's' : ''}` : 'No notes yet'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Textarea
                      value={noteContent}
                      onChange={(e) => onUpdateNote(category.id, e.target.value)}
                      placeholder="Add notes, ideas, or reminders for this category..."
                      className="min-h-[200px] border-stone-300 focus:border-amber-500 rounded-xl resize-none"
                      maxLength={5000}
                    />
                    {noteContent.length > 0 && (
                      <div className="absolute bottom-3 right-3">
                        <div className="text-xs text-stone-500 bg-white/90 px-2 py-1 rounded">
                          {noteContent.length}/5000
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
                    <span>Last edited: {new Date().toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded ${noteContent.length > 0 ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'}`}>
                      {noteContent.length > 0 ? 'Saved' : 'Empty'}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}

          {/* Add Category Card */}
          <Card className="border-2 border-dashed border-stone-300 hover:border-amber-400 transition-colors group">
            <button className="w-full h-full p-8 flex flex-col items-center justify-center text-stone-500 hover:text-amber-600">
              <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">Add New Category</h3>
              <p className="text-sm text-center">Create a new category to organize your notes</p>
            </button>
          </Card>
        </div>
      )}

      {/* Quick Notes */}
      <Card className="p-6 border border-stone-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-amber-600" />
          <h3 className="text-lg font-bold text-stone-900">Quick Notes</h3>
        </div>
        <Textarea
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          placeholder="Jot down quick thoughts, ideas, or reminders..."
          className="min-h-[100px] border-amber-300 focus:border-amber-500 rounded-xl bg-white/50"
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-stone-600">
            {quickNote.length > 0 ? `${quickNote.trim().split(/\s+/).length} words` : 'Start typing...'}
          </span>
          <Button
            onClick={handleSaveQuickNote}
            disabled={!quickNote.trim()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Quick Note
          </Button>
        </div>
      </Card>
    </div>
  )
}
