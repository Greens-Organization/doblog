'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Bold,
  Code,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered
} from 'lucide-react'
import { useState } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  const handleTextareaSelect = (
    e: React.SyntheticEvent<HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLTextAreaElement
    setSelectionStart(target.selectionStart)
    setSelectionEnd(target.selectionEnd)
  }

  const insertMarkdown = (before: string, after = '') => {
    const newValue =
      value.substring(0, selectionStart) +
      before +
      value.substring(selectionStart, selectionEnd) +
      after +
      value.substring(selectionEnd)

    onChange(newValue)
  }

  const handleBold = () => insertMarkdown('**', '**')
  const handleItalic = () => insertMarkdown('*', '*')
  const handleUnorderedList = () => insertMarkdown('\n- ')
  const handleOrderedList = () => insertMarkdown('\n1. ')
  const handleImage = () => insertMarkdown('![alt text](', ')')
  const handleLink = () => insertMarkdown('[link text](', ')')
  const handleCode = () => insertMarkdown('```\n', '\n```')

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded-md border bg-muted/50 p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBold}
          title="Negrito"
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          title="Itálico"
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUnorderedList}
          title="Lista não ordenada"
          type="button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOrderedList}
          title="Lista ordenada"
          type="button"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImage}
          title="Imagem"
          type="button"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLink}
          title="Link"
          type="button"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCode}
          title="Bloco de código"
          type="button"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleTextareaSelect}
        placeholder="Digite o conteúdo em Markdown..."
        className="min-h-[300px] font-mono text-sm"
      />
    </div>
  )
}
