'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { TiptapToolbar } from './tiptap-toolbar'

interface TiptapEditorProps {
    content?: string
    onChange?: (content: string) => void
    placeholder?: string
    editable?: boolean
}

export function TiptapEditor({
    content = '',
    onChange,
    placeholder = 'Escribe el contenido del artículo...',
    editable = true,
}: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
            }),
            Placeholder.configure({ placeholder }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-primary underline underline-offset-4' },
            }),
            Image.configure({
                HTMLAttributes: { class: 'rounded-lg max-w-full' },
            }),
        ],
        content,
        editable,
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm dark:prose-invert max-w-none min-h-[300px] px-4 py-3 focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(JSON.stringify(editor.getJSON()))
        },
    })

    if (!editor) return null

    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            {editable && <TiptapToolbar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    )
}

export type { Editor }
