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
      theme="vs-dark"
      defaultLanguage="plaintext"
      onMount={handleMount}
      onChange={onChange ? (v) => onChange(v ?? '') : undefined}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        fontSize: 12,
        lineNumbers: 'off',
        folding: false,
        renderLineHighlight: 'none',
        padding: { top: 8 },
      }}
    />
  )
}
