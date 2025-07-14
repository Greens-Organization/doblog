'use client'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND
} from 'lexical'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Redo,
  Trash2,
  Undo
} from 'lucide-react'
import { ToolBarLinkFunction } from './toolbar-functions/link-tool'
import { TranformationsToolFunction } from './toolbar-functions/transformations-tool'

const LowPriority = 1

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        LowPriority
      )
    )
  }, [editor])

  function transformSelectedText(transformFn: (text: string) => string) {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes()
        for (const node of nodes) {
          if ($isTextNode(node)) {
            const textContent = node.getTextContent()
            const newText = transformFn(textContent)
            node.setTextContent(newText)
          }
        }
      }
    })
  }

  return (
    <div className="toolbar" ref={toolbarRef}>
      <div className="flex items-center gap-1 p-2 border-b">
        <Button
          type="button"
          variant={canUndo ? 'outline' : 'ghost'}
          size="sm"
          disabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined)
          }}
          aria-label="Undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={canRedo ? 'outline' : 'ghost'}
          size="sm"
          disabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined)
          }}
          aria-label="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />
        <TranformationsToolFunction editor={editor} />
        <Separator orientation="vertical" className="mx-2 h-6" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode('h1'))
              }
            })
          }}
          aria-label="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode('h2'))
              }
            })
          }}
          aria-label="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode('h3'))
              }
            })
          }}
          aria-label="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode('h4'))
              }
            })
          }}
          aria-label="Heading 4"
        >
          <Heading4 className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
          }}
          aria-label="Insert Unordered List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
          }}
          aria-label="Insert Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode())
              }
            })
          }}
          aria-label="Insert Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-6" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => transformSelectedText((text) => text.toLowerCase())}
          aria-label="Lowercase"
        >
          a
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => transformSelectedText((text) => text.toUpperCase())}
          aria-label="Uppercase"
        >
          A
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            transformSelectedText((text) =>
              text.replace(/\b\w/g, (char) => char.toUpperCase())
            )
          }
          aria-label="Capitalize"
        >
          Aa
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />
        <ToolBarLinkFunction editor={editor} />
        <Separator orientation="vertical" className="mx-2 h-6" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            editor.update(() => {
              const root = $getRoot()
              root.clear()
            })
          }}
          aria-label="Clear Content"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
