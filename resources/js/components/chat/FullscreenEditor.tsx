import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Editor } from '@monaco-editor/react';
import { FileCode, X, Save, Redo } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useState } from 'react';
interface FullscreenEditorProps {
    code: string;
    language: string;
    onSave: (newCode: string) => void;
    onClose: () => void;
    onRegenerate?: () => void;
}

export default function FullscreenEditor({ code, language, onSave, onClose, onRegenerate }: FullscreenEditorProps) {
    const { appearance: theme } = useAppearance();
    const [value, setValue] = useState(code);

    // Map language to Monaco language identifier
    const getMonacoLanguage = (lang: string) => {
        const languageMap: Record<string, string> = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            html: 'html',
            css: 'css',
            json: 'json',
            md: 'markdown',
            py: 'python',
            rb: 'ruby',
            java: 'java',
            php: 'php',
            go: 'go',
            rust: 'rust',
            c: 'c',
            cpp: 'cpp',
            cs: 'csharp',
            sql: 'sql',
            sh: 'shell',
            bash: 'shell',
            xml: 'xml',
            yaml: 'yaml',
            yml: 'yaml',
        };

        return languageMap[lang] || lang;
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm">
            <Card className="flex h-full flex-col border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        <Badge variant="secondary" className="font-mono text-xs">
                            {language}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        {onRegenerate && (
                            <Button variant="outline" size="sm" onClick={onRegenerate}>
                                <Redo className="mr-2 h-4 w-4" />
                                Regenerate
                            </Button>
                        )}
                        <Button variant="default" size="sm" onClick={() => onSave(value)}>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <Editor
                        height="100%"
                        language={getMonacoLanguage(language)}
                        value={value}
                        onChange={(val) => setValue(val || '')}
                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                        options={{
                            fontSize: 14,
                            wordWrap: 'on',
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            lineNumbers: 'on',
                            glyphMargin: false,
                            folding: true,
                            lineDecorationsWidth: 10,
                            lineNumbersMinChars: 3,
                            renderWhitespace: 'selection',
                            rulers: [80, 100],
                            bracketPairColorization: { enabled: true },
                            guides: {
                                bracketPairs: true,
                                indentation: true,
                            },
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
