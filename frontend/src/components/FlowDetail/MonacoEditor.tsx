import { useEffect, useRef } from 'react'
import Editor, { useMonaco, type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface MonacoEditorProps {
  value: string
  language: string
  readOnly?: boolean
  onChange?: (value: string) => void
}

/** Singleton Monaco editor — stays mounted, updates content imperatively. */
export function MonacoEditor({ value, language, readOnly = true, onChange }: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monaco = useMonaco()

  useEffect(() => {
    if (!monaco) return
    monaco.editor.defineTheme('flexlab-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0e15',
        'editor.foreground': '#cbd5e1',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#64748b',
        'editorCursor.foreground': '#67e8f9',
        'editor.selectionBackground': '#164e63',
        'editor.lineHighlightBackground': '#111827',
      },
    })
  }, [monaco])

  const handleMount: OnMount = (ed) => {
    editorRef.current = ed
    ed.setValue(value)
  }

  // Update content imperatively to avoid model recreation on flow switch
  useEffect(() => {
    const ed = editorRef.current
    if (ed && ed.getValue() !== value) {
      ed.setValue(value)
    }
  }, [value])

  // Update language imperatively
  useEffect(() => {
    const ed = editorRef.current
    const model = ed?.getModel()
    if (model && monaco) {
      monaco.editor.setModelLanguage(model, language)
    }
  }, [language, monaco])

  return (
    <Editor
      theme="flexlab-dark"
      defaultLanguage="plaintext"
      onMount={handleMount}
      onChange={onChange ? (v) => onChange(v ?? '') : undefined}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        fontSize: 12,
        fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        folding: false,
        renderLineHighlight: 'line',
        overviewRulerBorder: false,
        padding: { top: 10, bottom: 10 },
      }}
    />
  )
}
