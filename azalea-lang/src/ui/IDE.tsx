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
        text("Welcome to Azalea!")
        button("Click Me")

    var x = 10
    if x > 5:
        text("X is big!")
    else:
        text("X is small")

    generate function greet(name): description "Return a greeting string"
    text(greet("User"))
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
            // For immediate feedback in IDE, let's use Interpreter by default now
            // as it supports the new UI primitives better without full WASM compilation overhead for simple scripts
            await interpreterRef.current.evaluate(ast);
            setOutput(interpreterRef.current.getOutput());

            // Optional: Also compile to WASM to verify it works
            // const codegen = new CodeGenerator();
            // const wat = codegen.generate(ast);
            // console.log('WAT:', wat);

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

            // Download file
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
        <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
            <header className="h-14 border-b border-gray-700 flex items-center px-4 justify-between bg-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-lg">Az</span>
                    </div>
                    <h1 className="font-bold text-xl">Azalea IDE</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowLessons(!showLessons)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors mr-2"
                    >
                        <BookOpen size={16} />
                        Lessons
                    </button>

                    <button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50"
                    >
                        <Sparkles size={16} />
                        {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
                    </button>

                    <button
                        onClick={handleExportCpp}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                    >
                        <Download size={16} />
                        Export C++
                    </button>

                    <button
                        onClick={handleRun}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                    >
                        <Play size={16} />
                        Run
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Lessons Sidebar Overlay */}
                {showLessons && (
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 z-10 p-4 overflow-auto shadow-xl">
                        <h2 className="font-bold mb-4 text-lg">Lessons</h2>
                        <div className="space-y-2">
                            {LESSONS.map(lesson => (
                                <button
                                    key={lesson.id}
                                    onClick={() => loadLesson(lesson)}
                                    className="w-full text-left p-2 hover:bg-gray-700 rounded flex items-center justify-between group"
                                >
                                    <span>{lesson.title}</span>
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Editor */}
                <div className="w-1/2 flex flex-col border-r border-gray-700">
                    <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2 text-gray-400 text-sm justify-between">
                        <div className="flex items-center gap-2">
                            <Code2 size={14} />
                            <span>main.az</span>
                        </div>
                        {activeLesson && (
                            <span className="text-blue-400 text-xs bg-blue-900/30 px-2 py-1 rounded">
                                Current Lesson: {activeLesson.title}
                            </span>
                        )}
                    </div>
                    {activeLesson && (
                        <div className="bg-gray-800/50 p-4 border-b border-gray-700 text-sm text-gray-300">
                            <p>{activeLesson.content}</p>
                        </div>
                    )}
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-gray-900 p-4 font-mono text-sm outline-none resize-none"
                        spellCheck={false}
                    />
                </div>

                {/* Preview & Output */}
                <div className="w-1/2 flex flex-col">
                    <div className="h-1/2 border-b border-gray-700 flex flex-col">
                        <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2 text-gray-400 text-sm">
                            <span>Preview</span>
                        </div>
                        <div id="preview-container" className="flex-1 bg-white p-4 text-black overflow-auto">
                            {/* UI Elements render here */}
                        </div>
                    </div>

                    <div className="h-1/2 flex flex-col bg-black">
                        <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2 text-gray-400 text-sm">
                            <Terminal size={14} />
                            <span>Console Output</span>
                        </div>
                        <div className="flex-1 p-4 font-mono text-sm text-green-400 overflow-auto">
                            {output.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
