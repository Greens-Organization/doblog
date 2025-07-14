import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { LinkIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { mergeRegister } from '@lexical/utils'
import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'

interface ToolBarLinkFunctionProps {
  editor: LexicalEditor
}

export function ToolBarLinkFunction({ editor }: ToolBarLinkFunctionProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [isLink, setIsLink] = useState(false)
  const [open, setOpen] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const nodes = selection.getNodes()
      let foundLink = false

      for (const node of nodes) {
        if ($isLinkNode(node) || $isLinkNode(node.getParent())) {
          foundLink = true
          break
        }
      }

      setIsLink(!!foundLink)
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      })
    )
  }, [editor, updateToolbar])

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            editor.getEditorState().read(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                const node = selection.getNodes()[0]
                const parent = node.getParent()
                const maybeLink = $isLinkNode(parent)
                  ? parent
                  : $isLinkNode(node)
                    ? node
                    : null

                if (maybeLink) {
                  setLinkUrl(maybeLink.getURL())
                } else {
                  setLinkUrl('')
                }
              }
            })
          } else {
            setLinkUrl('')
          }
          setOpen(nextOpen)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={isLink ? 'default' : 'outline'}
            size="sm"
            aria-label="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-2" side="top" align="start">
          <Input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="grow"
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
                setLinkUrl('')
                setOpen(false)
              }}
            >
              Remover
            </Button>
            <Button
              size="sm"
              className="grow"
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl)
                setOpen(false)
                setLinkUrl('')
              }}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}
