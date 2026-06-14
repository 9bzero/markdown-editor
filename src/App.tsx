import { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import { Download, Copy, Eye, Edit3, Columns, Moon } from 'lucide-react'

const DEFAULT_CONTENT = `# Welcome to Markdown Editor

A **live** markdown editor with split-pane preview.

## Features

- Real-time preview as you type
- Syntax highlighting for code blocks
- Download your file as \`.md\`
- Copy to clipboard
- Split, editor-only, or preview-only modes

## Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))
\`\`\`

## Table

| Feature | Status |
|---------|--------|
| Live preview | Done |
| Syntax highlight | Done |
| Export | Done |

> "The best markdown editor is the one you actually use." 

---

Try editing this text on the left!
`

type Mode = 'split' | 'edit' | 'preview'

export default function App() {
  const [content, setContent] = useState(() => localStorage.getItem('md-content') || DEFAULT_CONTENT)
  const [mode, setMode] = useState<Mode>('split')
  const [copied, setCopied] = useState(false)

  useEffect(() => { localStorage.setItem('md-content', content) }, [content])

  const html = marked.parse(content) as string

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [content])

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'document.md'; a.click()
    URL.revokeObjectURL(url)
  }, [content])

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center">
            <Moon size={14} className="text-white"/>
          </div>
          <span className="font-semibold text-sm">Markdown Editor</span>
        </div>
        <div className="flex items-center gap-1">
          {([['split','Split',<Columns size={14}/>],['edit','Editor',<Edit3 size={14}/>],['preview','Preview',<Eye size={14}/>]] as const).map(([m,label,icon])=>(
            <button key={m} onClick={()=>setMode(m as Mode)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${mode===m?'bg-blue-600 text-white':'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {icon}{label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{wordCount} words · {charCount} chars</span>
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
            <Copy size={14}/>{copied?'Copied!':'Copy'}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            <Download size={14}/>Download
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {(mode === 'split' || mode === 'edit') && (
          <div className={`flex flex-col ${mode==='split'?'w-1/2 border-r border-slate-800':' w-full'}`}>
            <div className="px-4 py-1.5 bg-slate-900/50 border-b border-slate-800 text-xs text-slate-500">EDITOR</div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="flex-1 w-full bg-slate-950 text-slate-300 p-6 outline-none resize-none font-mono text-sm leading-relaxed"
              style={{ caretColor: '#60a5fa' }}
              spellCheck={false}
            />
          </div>
        )}
        {(mode === 'split' || mode === 'preview') && (
          <div className={`flex flex-col ${mode==='split'?'w-1/2':'w-full'} overflow-hidden`}>
            <div className="px-4 py-1.5 bg-slate-900/50 border-b border-slate-800 text-xs text-slate-500">PREVIEW</div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="prose max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: html }}/>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
