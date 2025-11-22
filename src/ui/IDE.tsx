import React, { useState, useEffect, useRef } from 'react';
import { Lexer } from '../compiler/lexer';
import { Parser } from '../compiler/parser';
import { Runtime } from '../runtime';
import { Interpreter } from '../compiler/interpreter';
import { AIEnchancer } from '../ai';
import { Play, Sparkles, Terminal, Code2, BookOpen, ChevronRight, Download } from 'lucide-react';
import { LESSONS } from './lessons';
import type { Lesson } from './lessons';

const DEFAULT_CODE = `fn main():
    box():
        text("Welcome to Azalea AI")
        button("Run AI")

    # Ask AI to generate code dynamically
    ai "Create a function named 'greet' that takes a name and returns a greeting string"

    text(greet("User"))

    # Ask AI to optimize a block
    ai "Optimize this calculation":
        var result = 0
        var i = 0
        while i < 100:
            result = result + i
            i = i + 1
        text(result)
`;

export const IDE: React.FC = () => {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState<string[]>([]);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [showLessons, setShowLessons] = useState(false);

    const runtimeRef = useRef<Runtime | null>(null);
    const interpreterRef = useRef<Interpreter | null>(null);
    const aiRef = useRef<AIEnchancer | null>(null);

    useEffect(() => {
        runtimeRef.current = new Runtime('preview-container');
        interpreterRef.current = new Interpreter('preview-container');
        aiRef.current = new AIEnchancer();
    }, []);

    const handleRun = async () => {
        if (!interpreterRef.current) return;

        try {
            // 1. Lex
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();

            // 2. Parse
            const parser = new Parser(tokens);
            const ast = parser.parse();

            // 3. Interpret (Scripting Mode)
            await interpreterRef.current.evaluate(ast);
            setOutput(interpreterRef.current.getOutput());

        } catch (e: any) {
            setOutput([`Error: ${e.message || e}`]);
        }
    };

    const handleEnhance = async () => {
        if (!aiRef.current) return;
        setIsEnhancing(true);
        try {
            const enhanced = await aiRef.current.enhance(code);
            setCode(enhanced);
        } catch (e) {
            console.error(e);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleExportCpp = async () => {
        if (!code) return;
        try {
            const { Lexer } = await import('../compiler/lexer');
            const { Parser } = await import('../compiler/parser');
            const { CppGenerator } = await import('../compiler/cpp_codegen');

            const lexer = new Lexer(code);
            const parser = new Parser(lexer.tokenize());
            const program = parser.parse();

            const generator = new CppGenerator();
            const cppCode = generator.generate(program);

            const blob = new Blob([cppCode], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'main.cpp';
            a.click();
            URL.revokeObjectURL(url);

            setOutput(prev => [...prev, "Exported to main.cpp"]);
        } catch (e: any) {
            setOutput(prev => [...prev, `Export Error: ${e.message}`]);
        }
    };

    const loadLesson = (lesson: Lesson) => {
        setActiveLesson(lesson);
        setCode(lesson.initialCode);
        setShowLessons(false);
    };

    return (
        <div className="h-screen w-full bg-gray-950 text-white flex flex-col font-sans">
            <header className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <span className="font-bold text-xl">Az</span>
                    </div>
                    <h1 className="font-bold text-xl tracking-tight">Azalea IDE</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowLessons(!showLessons)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all border border-gray-700 text-sm font-medium"
                    >
                        <BookOpen size={16} className="text-blue-400"/>
                        Lessons
                    </button>

                    <div className="h-6 w-px bg-gray-800 mx-2"></div>

                    <button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 rounded-lg transition-all disabled:opacity-50 text-sm font-medium backdrop-blur-sm"
                    >
                        <Sparkles size={16} />
                        {isEnhancing ? 'AI Optimizing...' : 'AI Optimize'}
                    </button>

                    <button
                        onClick={handleExportCpp}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all border border-gray-700 text-sm font-medium"
                    >
                        <Download size={16} />
                        Export C++
                    </button>

                    <button
                        onClick={handleRun}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg transition-all shadow-lg shadow-green-900/20 font-bold text-sm"
                    >
                        <Play size={16} fill="currentColor" />
                        Run Code
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Lessons Sidebar Overlay */}
                {showLessons && (
                    <div className="absolute left-0 top-0 bottom-0 w-80 bg-gray-900 border-r border-gray-800 z-20 p-6 overflow-auto shadow-2xl animate-in slide-in-from-left duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-xl">Lessons</h2>
                            <button onClick={() => setShowLessons(false)} className="text-gray-500 hover:text-white">×</button>
                        </div>
                        <div className="space-y-3">
                            {LESSONS.map(lesson => (
                                <button
                                    key={lesson.id}
                                    onClick={() => loadLesson(lesson)}
                                    className="w-full text-left p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-800 hover:border-gray-700 flex items-center justify-between group transition-all"
                                >
                                    <span className="font-medium text-gray-300 group-hover:text-white">{lesson.title}</span>
                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Editor */}
                <div className="w-1/2 flex flex-col border-r border-gray-800 bg-gray-900/30">
                    <div className="h-10 bg-gray-900/80 border-b border-gray-800 flex items-center px-4 gap-3 text-gray-400 text-xs font-mono uppercase tracking-wider backdrop-blur-sm">
                        <Code2 size={14} />
                        <span>main.az</span>
                        {activeLesson && (
                            <span className="ml-auto text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30 normal-case">
                                Lesson: {activeLesson.title}
                            </span>
                        )}
                    </div>
                    {activeLesson && (
                        <div className="bg-blue-900/10 p-4 border-b border-blue-900/20 text-sm text-blue-200/80 leading-relaxed">
                            <p>{activeLesson.content}</p>
                        </div>
                    )}
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-transparent p-6 font-mono text-sm leading-relaxed text-gray-300 outline-none resize-none focus:bg-gray-900/50 transition-colors"
                        spellCheck={false}
                    />
                </div>

                {/* Preview & Output */}
                <div className="w-1/2 flex flex-col bg-gray-900">
                    <div className="h-3/5 flex flex-col border-b border-gray-800">
                        <div className="h-10 bg-gray-900/80 border-b border-gray-800 flex items-center px-4 gap-2 text-gray-400 text-xs font-mono uppercase tracking-wider">
                            <span>Preview</span>
                        </div>
                        <div id="preview-container" className="flex-1 bg-white/5 p-8 text-white overflow-auto relative">
                            {/* Grid Pattern Background */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                                 style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            </div>
                            <div className="relative z-10">
                                {/* UI Elements render here */}
                            </div>
                        </div>
                    </div>

                    <div className="h-2/5 flex flex-col bg-black/50">
                        <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-2 text-gray-400 text-xs font-mono uppercase tracking-wider">
                            <Terminal size={14} />
                            <span>Console Output</span>
                        </div>
                        <div className="flex-1 p-4 font-mono text-sm text-emerald-400 overflow-auto">
                            {output.length === 0 ? (
                                <span className="text-gray-600 italic">Ready...</span>
                            ) : (
                                output.map((line, i) => (
                                    <div key={i} className="mb-1 animate-in fade-in duration-200">
                                        <span className="opacity-50 mr-2">$</span>
                                        {line}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
