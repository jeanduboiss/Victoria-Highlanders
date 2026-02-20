'use client'

import { type Editor } from '@tiptap/react'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Minus,
    Undo,
    Redo,
    Link as LinkIcon,
    Unlink,
    ImagePlus,
} from 'lucide-react'

interface TiptapToolbarProps {
    editor: Editor
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
    function handleLink() {
        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run()
            return
        }
        const url = window.prompt('URL del enlace:')
        if (!url) return
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    function handleImage() {
        const url = window.prompt('URL de la imagen:')
        if (!url) return
        editor.chain().focus().setImage({ src: url }).run()
    }

    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
            {/* Texto */}
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Negrita"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Cursiva"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('strike')}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Tachado"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('code')}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                aria-label="Código"
            >
                <Code className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Headings */}
            <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                aria-label="Encabezado 2"
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 3 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                aria-label="Encabezado 3"
            >
                <Heading3 className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Listas */}
            <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Lista sin orden"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Lista ordenada"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Block */}
            <Toggle
                size="sm"
                pressed={editor.isActive('blockquote')}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Cita"
            >
                <Quote className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={false}
                onPressedChange={() => editor.chain().focus().setHorizontalRule().run()}
                aria-label="Línea horizontal"
            >
                <Minus className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Media */}
            <Toggle
                size="sm"
                pressed={editor.isActive('link')}
                onPressedChange={handleLink}
                aria-label="Enlace"
            >
                {editor.isActive('link') ? <Unlink className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
            </Toggle>
            <Toggle size="sm" pressed={false} onPressedChange={handleImage} aria-label="Imagen">
                <ImagePlus className="h-4 w-4" />
            </Toggle>

            <div className="flex-1" />

            {/* Undo/Redo */}
            <Toggle
                size="sm"
                pressed={false}
                onPressedChange={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                aria-label="Deshacer"
            >
                <Undo className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={false}
                onPressedChange={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                aria-label="Rehacer"
            >
                <Redo className="h-4 w-4" />
            </Toggle>
        </div>
    )
}
