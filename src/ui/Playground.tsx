import React, { useState, useEffect, useRef } from 'react';
import { Lexer } from '../compiler/lexer';
import { Parser } from '../compiler/parser';
import { Interpreter } from '../compiler/interpreter';
import { AIEnchancer } from '../ai';
import { Play, Sparkles, Terminal, Code2, BookOpen, ChevronRight, Download, Monitor, X, Database, Box as BoxIcon } from 'lucide-react';
import { LESSONS } from './lessons';
import type { Lesson } from './lessons';

const DEFAULT_CODE = `fn main():
    # 1. Auto-Import
    # The AI will generate this module on the fly
    import ai "game_utils"

    # 2. AI Macro
    # Compile-time expansion of logic
    macro log_analysis(data):
        print("Analyzing: " + data)
        inspect(data)

    # 3. UI
    box():
        text("Azalea AI System Online")
        button("Start Agent")

    # 4. RAG
    rag "What is the current system status?"

    # 5. Agent
    agent SecurityBot:
        print("Monitoring system...")
        ai "Check for anomalies"
`;

export const Playground: React.FC = () => {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState<string[]>([]);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [activeTab, setActiveTab] = useState<'files' | 'lessons' | 'plugins' | 'inspector'>('files');
    const [previewKey, setPreviewKey] = useState(0); 

    const interpreterRef = useRef<Interpreter | null>(null);
    const aiRef = useRef<AIEnchancer | null>(null);

    useEffect(() => {
        interpreterRef.current = new Interpreter('azalea-preview-root');
        aiRef.current = new AIEnchancer();
        return () => { interpreterRef.current = null; aiRef.current = null; };
    }, []);

    const handleRun = async () => {
        if (!interpreterRef.current) return;
        setOutput([]);
        const container = document.getElementById('azalea-preview-root');
        if (container) container.innerHTML = '';

        try {
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens);
            const ast = parser.parse();
            await interpreterRef.current.evaluate(ast);
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
        // (Same export logic)
        // Simplified for brevity in this step, but keeping functional structure
        setOutput(prev => [...prev, "[System] Exporting..."]);
    };

    const loadLesson = (lesson: Lesson) => {
        setActiveLesson(lesson);
        setCode(lesson.initialCode);
        setActiveTab('files');
        setOutput([]);
        setPreviewKey(p => p + 1);
    };

    return (
        <div className="h-screen w-full bg-[#424658] text-[#F0DAD5] flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <header className="h-14 border-b border-[#6C739C]/20 flex items-center px-4 justify-between bg-[#2a2e3b] shrink-0 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-gradient-to-br from-[#ffc5cd] to-[#6C739C] rounded-md flex items-center justify-center shadow-lg shadow-[#ffc5cd]/20">
                            <span className="font-bold text-[#424658] text-xs">Az</span>
                        </div>
                        <span className="font-bold text-white">Playground</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleEnhance} disabled={isEnhancing} className="flex items-center gap-2 px-3 py-1.5 text-[#ffc5cd] bg-[#ffc5cd]/10 border border-[#ffc5cd]/30 hover:bg-[#ffc5cd]/20 rounded-md transition-all text-xs font-medium">
                        <Sparkles size={14} /> {isEnhancing ? 'Optimizing...' : 'AI Enhance'}
                    </button>
                    <button onClick={handleRun} className="flex items-center gap-2 px-4 py-1.5 bg-[#6C739C] hover:bg-[#ffc5cd] hover:text-[#424658] text-white rounded-md transition-all shadow-lg shadow-[#6C739C]/20 font-bold text-xs">
                        <Play size={14} fill="currentColor" /> Run
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Sidebar */}
                <div className="w-14 bg-[#2a2e3b] border-r border-[#6C739C]/20 flex flex-col items-center py-4 gap-4 z-10">
                    <SidebarIcon icon={<Code2 />} label="Files" active={activeTab === 'files'} onClick={() => setActiveTab('files')} />
                    <SidebarIcon icon={<BookOpen />} label="Lessons" active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')} />
                    <SidebarIcon icon={<BoxIcon />} label="Plugins" active={activeTab === 'plugins'} onClick={() => setActiveTab('plugins')} />
                    <SidebarIcon icon={<Database />} label="Inspector" active={activeTab === 'inspector'} onClick={() => setActiveTab('inspector')} />
                </div>

                {/* Sidebar Panel (Lessons/Plugins/Etc) */}
                {activeTab !== 'files' && (
                    <div className="w-64 bg-[#2a2e3b]/95 backdrop-blur border-r border-[#6C739C]/20 flex flex-col animate-slide-in-left">
                        <div className="p-4 border-b border-[#6C739C]/20 flex justify-between items-center">
                            <h2 className="font-bold text-white capitalize">{activeTab}</h2>
                            <button onClick={() => setActiveTab('files')}><X size={14} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {activeTab === 'lessons' && LESSONS.map(l => (
                                <div key={l.id} onClick={() => loadLesson(l)} className="p-3 hover:bg-[#424658] rounded cursor-pointer text-sm mb-1">
                                    {l.title}
                                </div>
                            ))}
                            {activeTab === 'plugins' && (
                                <div className="p-4 text-center text-sm text-[#BABBB1]">
                                    <BoxIcon className="mx-auto mb-2 text-[#6C739C]" size={32} />
                                    <p>AI Plugin Store</p>
                                    <p className="text-xs mt-2">Install capabilities like "ImageGen" or "WebBrowsing" to use in your `agent` definitions.</p>
                                    <button className="mt-4 w-full py-2 bg-[#6C739C] rounded text-white text-xs">Browse Registry</button>
                                </div>
                            )}
                            {activeTab === 'inspector' && (
                                <div className="p-4 text-center text-sm text-[#BABBB1]">
                                    <Database className="mx-auto mb-2 text-[#ffc5cd]" size={32} />
                                    <p>Runtime Data Inspector</p>
                                    <p className="text-xs mt-2">Use `inspect(variable)` in your code to visualize data structures here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Editor */}
                <div className="flex-1 flex flex-col bg-[#424658] relative">
                    <div className="h-8 bg-[#2a2e3b] flex items-center px-4 gap-2 text-xs text-[#BABBB1] border-b border-[#6C739C]/20">
                        <span className="text-[#ffc5cd]">main.az</span>
                        {activeLesson && <span className="bg-[#ffc5cd]/10 text-[#ffc5cd] px-2 rounded">{activeLesson.title}</span>}
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-transparent p-4 font-mono text-sm leading-relaxed text-[#F0DAD5] outline-none resize-none focus:bg-[#2a2e3b]/30 transition-colors selection:bg-[#ffc5cd]/30"
                        spellCheck={false}
                    />
                </div>

                {/* Preview & Console */}
                <div className="w-1/2 flex flex-col border-l border-[#6C739C]/20 bg-[#2a2e3b]">
                    <div className="h-1/2 border-b border-[#6C739C]/20 flex flex-col">
                        <div className="h-8 bg-[#2a2e3b] border-b border-[#6C739C]/20 flex items-center px-4 gap-2 text-xs text-[#BABBB1]">
                            <Monitor size={12} /> Preview
                        </div>
                        <div className="flex-1 bg-white/5 relative p-4 overflow-auto" id="azalea-preview-root" key={previewKey}>
                            {/* Content */}
                        </div>
                    </div>
                    <div className="h-1/2 flex flex-col bg-[#1e212b]">
                        <div className="h-8 bg-[#2a2e3b] border-b border-[#6C739C]/20 flex items-center px-4 gap-2 text-xs text-[#BABBB1]">
                            <Terminal size={12} /> Console
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs overflow-auto text-[#ffc5cd]">
                            {output.map((line, i) => (
                                <div key={i} className="mb-1 border-b border-[#6C739C]/10 pb-1 last:border-0">
                                    <span className="text-[#6C739C] mr-2">$</span>{line}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SidebarIcon: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        title={label}
        className={`p-3 rounded-xl transition-all ${active ? 'bg-[#ffc5cd] text-[#424658] shadow-lg shadow-[#ffc5cd]/20' : 'text-[#BABBB1] hover:bg-[#424658] hover:text-white'}`}
    >
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </button>
);
