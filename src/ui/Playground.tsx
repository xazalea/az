import React, { useState, useEffect, useRef } from 'react';
import { Lexer } from '../compiler/lexer';
import { Parser } from '../compiler/parser';
import { Interpreter } from '../compiler/interpreter';
import { AIEnchancer } from '../ai';
import { Play, Sparkles, Terminal, Code2, BookOpen, ChevronRight, Download, Settings, Monitor, X } from 'lucide-react';
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

export const Playground: React.FC = () => {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState<string[]>([]);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [showLessons, setShowLessons] = useState(false);
    const [previewKey, setPreviewKey] = useState(0); // Force re-render of preview

    // Refs for singletons
    const interpreterRef = useRef<Interpreter | null>(null);
    const aiRef = useRef<AIEnchancer | null>(null);

    // Initialization
    useEffect(() => {
        // Initialize Interpreter attached to the preview container ID
        interpreterRef.current = new Interpreter('azalea-preview-root');
        aiRef.current = new AIEnchancer();
        
        return () => {
            interpreterRef.current = null;
            aiRef.current = null;
        };
    }, []);

    const handleRun = async () => {
        if (!interpreterRef.current) return;
        
        // Clear previous output in UI state
        setOutput([]);
        
        // Reset DOM
        const container = document.getElementById('azalea-preview-root');
        if (container) container.innerHTML = '';

        try {
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();

            await interpreterRef.current.evaluate(ast);
            
            // Update console output
            setOutput([...interpreterRef.current.getOutput()]);
            
        } catch (e: any) {
            setOutput(prev => [...prev, `Error: ${e.message || e}`]);
        }
    };

    const handleEnhance = async () => {
        if (!aiRef.current) return;
        setIsEnhancing(true);
        try {
            const enhanced = await aiRef.current.enhance(code);
            setCode(enhanced);
            setOutput(prev => [...prev, "[System] AI optimization applied."]);
        } catch (e: any) {
            setOutput(prev => [...prev, `[System] AI Error: ${e.message}`]);
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

            setOutput(prev => [...prev, "[System] Exported to main.cpp"]);
        } catch (e: any) {
            setOutput(prev => [...prev, `[System] Export Error: ${e.message}`]);
        }
    };

    const loadLesson = (lesson: Lesson) => {
        setActiveLesson(lesson);
        setCode(lesson.initialCode);
        setShowLessons(false);
        setOutput([]);
        setPreviewKey(p => p + 1); // Reset preview
    };

    return (
        <div className="h-screen w-full bg-[#0D1117] text-gray-300 flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="h-14 border-b border-gray-800 flex items-center px-4 justify-between bg-[#161b22] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="font-bold text-white text-xs">Az</span>
                        </div>
                        <span className="font-bold text-gray-200">Playground</span>
                    </div>
                    
                    <div className="h-4 w-px bg-gray-700 mx-2"></div>
                    
                    <button
                        onClick={() => setShowLessons(!showLessons)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${showLessons ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <BookOpen size={14} />
                        Lessons
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="flex items-center gap-2 px-3 py-1.5 text-purple-400 hover:bg-purple-500/10 border border-purple-500/30 rounded-md transition-all disabled:opacity-50 text-xs font-medium"
                    >
                        <Sparkles size={14} />
                        {isEnhancing ? 'Optimizing...' : 'AI Optimize'}
                    </button>

                    <button
                        onClick={handleExportCpp}
                        className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-all text-xs font-medium"
                    >
                        <Download size={14} />
                        Export C++
                    </button>

                    <button
                        onClick={handleRun}
                        className="flex items-center gap-2 px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-all shadow-sm font-medium text-xs"
                    >
                        <Play size={14} fill="currentColor" />
                        Run
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Lessons Sidebar */}
                {showLessons && (
                    <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#161b22] border-r border-gray-800 z-30 shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="font-bold text-white">Lessons</h2>
                            <button onClick={() => setShowLessons(false)} className="text-gray-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {LESSONS.map(lesson => (
                                <button
                                    key={lesson.id}
                                    onClick={() => loadLesson(lesson)}
                                    className={`w-full text-left p-3 rounded-lg text-sm flex items-center justify-between group transition-all ${activeLesson?.id === lesson.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <span className="font-medium truncate">{lesson.title}</span>
                                    {activeLesson?.id === lesson.id && <ChevronRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Editor Pane */}
                <div className="w-1/2 flex flex-col border-r border-gray-800 bg-[#0D1117]">
                    <div className="h-9 bg-[#161b22] border-b border-gray-800 flex items-center px-4 justify-between text-xs text-gray-400 select-none">
                        <div className="flex items-center gap-2">
                            <Code2 size={14} />
                            <span>main.az</span>
                        </div>
                        {activeLesson && (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                                {activeLesson.title}
                            </span>
                        )}
                    </div>
                    
                    {activeLesson && (
                        <div className="bg-blue-900/10 p-4 border-b border-blue-900/20 text-sm text-blue-200/80 leading-relaxed font-sans">
                            <p>{activeLesson.content}</p>
                        </div>
                    )}

                    <div className="flex-1 relative">
                         <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm leading-relaxed text-gray-300 outline-none resize-none focus:bg-[#161b22]/30 transition-colors selection:bg-blue-500/30"
                            spellCheck={false}
                            placeholder="// Start typing Azalea code..."
                        />
                    </div>
                </div>

                {/* Right Pane (Preview + Console) */}
                <div className="w-1/2 flex flex-col bg-[#0D1117]">
                    
                    {/* Preview Section */}
                    <div className="h-3/5 flex flex-col border-b border-gray-800">
                        <div className="h-9 bg-[#161b22] border-b border-gray-800 flex items-center px-4 gap-2 text-gray-400 text-xs select-none">
                            <Monitor size={14} />
                            <span>Preview</span>
                        </div>
                        <div className="flex-1 bg-[#ffffff] relative overflow-auto">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            </div>
                            {/* Preview Root - Content injected here by Interpreter */}
                            <div id="azalea-preview-root" key={previewKey} className="relative z-10 p-8 font-sans text-gray-900">
                                {/* Dynamic Content */}
                            </div>
                        </div>
                    </div>

                    {/* Console Section */}
                    <div className="h-2/5 flex flex-col bg-[#0D1117]">
                        <div className="h-9 bg-[#161b22] border-b border-gray-800 flex items-center px-4 gap-2 text-gray-400 text-xs select-none">
                            <Terminal size={14} />
                            <span>Console Output</span>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs overflow-auto space-y-1">
                            {output.length === 0 ? (
                                <span className="text-gray-600 italic select-none">// Output will appear here...</span>
                            ) : (
                                output.map((line, i) => (
                                    <div key={i} className="flex gap-2 text-gray-300 border-b border-gray-800/50 pb-1 mb-1 last:border-0">
                                        <span className="text-blue-500 select-none">{'>'}</span>
                                        <span className="whitespace-pre-wrap break-words">{line}</span>
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

