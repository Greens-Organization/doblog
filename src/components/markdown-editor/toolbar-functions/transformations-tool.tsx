import { Button } from '@/components/ui/button'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND
} from 'lexical'

import { Bold, Italic, Underline } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const LowPriority = 1

interface TranformationsToolFunctionProps {
  editor: LexicalEditor
}

export function TranformationsToolFunction({
  editor
}: TranformationsToolFunctionProps) {
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar()
          return false
        },
        LowPriority
      )
    )
  }, [editor, updateToolbar])

  return (
    <>
      <Button
        type="button"
        variant={isBold ? 'default' : 'outline'}
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }}
        aria-label="Format Bold"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={isItalic ? 'default' : 'outline'}
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        }}
        aria-label="Format Italic"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={isUnderline ? 'default' : 'outline'}
        size="sm"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
        }}
        aria-label="Format Underline"
      >
        <Underline className="w-4 h-4" />
      </Button>
    </>
  )
}
