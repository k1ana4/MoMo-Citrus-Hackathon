import Editor from '@monaco-editor/react';
import { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: string;
  leakLines: number[];
}

export default function CodeEditor({ value, onChange, language, leakLines }: Props) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationIds = useRef<string[]>([]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations = leakLines.map((line) => ({
      range: new monacoRef.current.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'leak-line',
        glyphMarginClassName: 'leak-glyph',
        hoverMessage: { value: '⚠️ **Memory leak detected on this line**' },
        overviewRuler: {
          color: 'red',
          position: monacoRef.current.editor.OverviewRulerLane.Right,
        },
      },
    }));

    decorationIds.current = editorRef.current.deltaDecorations(
      decorationIds.current,
      decorations
    );
  }, [leakLines]);

  const monacoLang = language === 'cpp' || language === 'c' ? 'cpp' : language;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height="550px"
        language={monacoLang}
        value={value}
        onChange={(v) => onChange(v || '')}
        theme="vs-dark"
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
        }}
        options={{
          glyphMargin: true,
          fontSize: 14,
          minimap: { enabled: false },
          padding: { top: 10 },
        }}
      />
    </div>
  );
}