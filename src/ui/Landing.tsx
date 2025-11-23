import React, { useState } from 'react';
import { Code2, Layers, Cpu, Sparkles, ArrowRight, Github, Package, Terminal, Search, Zap, Database, BookOpen } from 'lucide-react';

export const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const [version] = useState('v1.0.0 AI-Native');

    return (
        <div className="min-h-screen bg-[#424658] text-[#F0DAD5] font-sans selection:bg-[#ffc5cd]/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="border-b border-[#6C739C]/20 backdrop-blur-lg sticky top-0 z-50 bg-[#424658]/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Azalea Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-[#ffc5cd]/20" />
                        <span className="font-bold text-2xl tracking-tight text-white">Azalea</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#BABBB1]">
                        <a href="#features" className="hover:text-[#ffc5cd] transition-colors">Features</a>
                        <a href="#ecosystem" className="hover:text-[#ffc5cd] transition-colors">Ecosystem</a>
                        <a href="#docs" className="hover:text-[#ffc5cd] transition-colors">Docs</a>
                        <a href="https://github.com/xazalea/az" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                            <Github size={18} />
                        </a>
                        <button 
                            onClick={onStart}
                            className="bg-[#6C739C] hover:bg-[#ffc5cd] hover:text-[#424658] text-white px-6 py-2 rounded-full transition-all shadow-lg shadow-[#6C739C]/30 font-semibold"
                        >
                            Open Playground
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main>
                <div className="relative pt-32 pb-20 px-6">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#6C739C]/20 rounded-full blur-[120px] pointer-events-none" />
                    
                    <div className="max-w-5xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffc5cd]/10 border border-[#ffc5cd]/20 text-[#ffc5cd] text-sm font-medium mb-8 animate-fade-in-up">
                            <Sparkles size={14} />
                            <span>{version}</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight text-white drop-shadow-xl">
                            Code that <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffc5cd] to-[#F0DAD5]">Thinks</span>.
                        </h1>
                        <p className="text-xl md:text-2xl text-[#BABBB1] mb-12 leading-relaxed max-w-3xl mx-auto">
                            The world's first truly AI-native programming language. 
                            <br />
                            Compiler-integrated LLMs, self-healing runtime, and autonomous agents.
                        </p>
                        
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <button 
                                onClick={onStart}
                                className="group px-8 py-4 bg-[#ffc5cd] hover:bg-white text-[#424658] rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-xl shadow-[#ffc5cd]/20 hover:scale-105"
                            >
                                Start Coding
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center gap-4">
                                <code className="bg-[#2a2e3b] px-6 py-4 rounded-xl border border-[#6C739C]/30 text-[#F0DAD5] font-mono shadow-lg flex items-center gap-3">
                                    <span className="text-[#6C739C]">$</span> npm install -g azae
                                    <button className="ml-4 text-[#BABBB1] hover:text-white" title="Copy">
                                        <span className="sr-only">Copy</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </button>
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

            {/* AI Native Features */}
            <div id="features" className="py-24 bg-[#2a2e3b]/50 backdrop-blur-sm border-y border-[#6C739C]/10">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-4 text-white">AI Built into the Syntax</h2>
                    <p className="text-center text-[#BABBB1] mb-16 max-w-2xl mx-auto">
                        Azalea isn't just a language wrapped in an AI IDE. The language itself has primitives for reasoning, memory, and self-correction.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Terminal className="text-[#ffc5cd]" />}
                            title="Agent Loops"
                            description="Define autonomous agents with the 'agent' keyword. The runtime manages their memory, execution loop, and goal-seeking behavior natively."
                        />
                        <FeatureCard 
                            icon={<Search className="text-[#6C739C]" />}
                            title="Semantic RAG"
                            description="Native 'rag' command performs vector search on your codebase or loaded documentation instantly, allowing code to query its own context."
                        />
                        <FeatureCard 
                            icon={<Zap className="text-[#F0DAD5]" />}
                            title="Auto-Import"
                            description="Import libraries that don't exist yet. The AI compiler generates module code on the fly based on your usage patterns."
                        />
                        <FeatureCard 
                            icon={<Layers className="text-[#ffc5cd]" />}
                            title="Macros"
                            description="Compile-time AI expansion. Describe what you want in natural language, and the compiler synthesizes the boilerplate AST."
                        />
                        <FeatureCard 
                            icon={<Database className="text-[#6C739C]" />}
                            title="Data Inspector"
                            description="Runtime 'inspect(var)' uses AI to explain complex data structures, visualize state, and suggest potential manipulations."
                        />
                        <FeatureCard 
                            icon={<Cpu className="text-[#F0DAD5]" />}
                            title="Self-Healing Runtime"
                            description="Runtime errors trigger an automatic AI analysis pass that diagnoses the crash and suggests or even applies a hot-fix."
                        />
                    </div>
                </div>
            </div>

            {/* Ecosystem Section */}
            <div id="ecosystem" className="py-24 max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-16 text-white">Professional Ecosystem</h2>
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* VS Code */}
                    <div className="bg-[#2a2e3b] p-8 rounded-2xl border border-[#6C739C]/20 hover:border-[#ffc5cd]/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#007ACC]/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-2xl font-bold text-white">VS Code Extension</h3>
                            <Code2 size={32} className="text-[#007ACC]" />
                        </div>
                        <p className="text-[#BABBB1] mb-6 relative z-10">
                            Transform your editor into an AI-native cockpit. Features include:
                        </p>
                        <ul className="text-[#BABBB1] text-sm space-y-2 mb-8 relative z-10">
                            <li className="flex items-center gap-2"><Sparkles size={14} className="text-[#ffc5cd]"/> "Sapphire Mist" Professional Theme</li>
                            <li className="flex items-center gap-2"><Sparkles size={14} className="text-[#ffc5cd]"/> Semantic Syntax Highlighting</li>
                            <li className="flex items-center gap-2"><Sparkles size={14} className="text-[#ffc5cd]"/> Inline Agent Definitions</li>
                        </ul>
                        <a href="https://marketplace.visualstudio.com/items?itemName=RohanSalem.azalea-vscode" target="_blank" rel="noreferrer" className="block w-full py-3 bg-[#424658] hover:bg-[#6C739C] rounded-lg text-white font-medium transition-colors relative z-10 text-center">
                            Install from Marketplace
                        </a>
                    </div>

                    {/* NPM */}
                    <div className="bg-[#2a2e3b] p-8 rounded-2xl border border-[#6C739C]/20 hover:border-[#ffc5cd]/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CB3837]/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-2xl font-bold text-white">NPM Package</h3>
                            <Package size={32} className="text-[#CB3837]" />
                        </div>
                        <p className="text-[#BABBB1] mb-6 relative z-10">
                            Lightweight CLI toolchain. Compile, run, and manage Azalea projects from any terminal.
                        </p>
                        <div className="bg-[#1e212b] p-4 rounded-lg font-mono text-sm text-[#F0DAD5] mb-6 border border-[#6C739C]/10 relative z-10">
                            &gt; npm install -g azae<br/>
                            &gt; azae init my-project<br/>
                            &gt; azae run main.az
                        </div>
                        <button className="w-full py-3 bg-[#424658] hover:bg-[#6C739C] rounded-lg text-white font-medium transition-colors relative z-10">
                            View on NPM
                        </button>
                    </div>
                </div>
            </div>

            {/* Documentation Section */}
            <div id="docs" className="py-24 bg-[#2a2e3b] border-y border-[#6C739C]/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="text-4xl font-bold mb-6 text-white">Comprehensive Documentation</h2>
                            <p className="text-[#BABBB1] text-lg mb-8 leading-relaxed">
                                Whether you're building a simple script or a complex autonomous agent system, our documentation has you covered. 
                                Learn about the <code>agent</code> lifecycle, how <code>rag</code> indexing works, and how to write custom AI macros.
                            </p>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="flex items-center gap-4 p-4 bg-[#424658] rounded-xl hover:bg-[#424658]/80 transition-colors group">
                                    <div className="p-2 bg-[#ffc5cd]/10 rounded-lg text-[#ffc5cd] group-hover:scale-110 transition-transform">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Language Guide</h4>
                                        <p className="text-sm text-[#BABBB1]">Syntax, types, and control flow.</p>
                                    </div>
                                    <ArrowRight className="ml-auto text-[#6C739C] group-hover:translate-x-1 transition-transform" />
                                </a>
                                <a href="#" className="flex items-center gap-4 p-4 bg-[#424658] rounded-xl hover:bg-[#424658]/80 transition-colors group">
                                    <div className="p-2 bg-[#6C739C]/10 rounded-lg text-[#6C739C] group-hover:scale-110 transition-transform">
                                        <Cpu size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">AI Primitives API</h4>
                                        <p className="text-sm text-[#BABBB1]">Deep dive into `ai`, `agent`, and `rag`.</p>
                                    </div>
                                    <ArrowRight className="ml-auto text-[#6C739C] group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="bg-[#1e212b] rounded-2xl border border-[#6C739C]/20 p-6 shadow-2xl">
                                <div className="flex items-center gap-2 mb-4 border-b border-[#6C739C]/10 pb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"/>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                                    <div className="w-3 h-3 rounded-full bg-green-500"/>
                                    <span className="ml-2 text-xs text-[#6C739C] font-mono">docs/agent-lifecycle.md</span>
                                </div>
                                <div className="space-y-3 font-mono text-sm">
                                    <p className="text-[#BABBB1]"># Agent Lifecycle</p>
                                    <p className="text-[#6C739C]">When an agent is defined:</p>
                                    <p className="text-[#F0DAD5] pl-4">1. Memory context is initialized.</p>
                                    <p className="text-[#F0DAD5] pl-4">2. The planner LLM is loaded.</p>
                                    <p className="text-[#F0DAD5] pl-4">3. The `body` is executed as the initial prompt.</p>
                                    <p className="text-[#BABBB1] pt-2">// Example configuration</p>
                                    <p className="text-[#ffc5cd]">agent<span className="text-[#F0DAD5]"> Worker:</span></p>
                                    <p className="text-[#F0DAD5] pl-4">memory_retention = <span className="text-[#a3e4d7]">"long_term"</span></p>
                                    <p className="text-[#F0DAD5] pl-4">model = <span className="text-[#a3e4d7]">"llama-3-8b"</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                {/* Footer */}
                <footer className="border-t border-[#6C739C]/20 py-12 bg-[#2a2e3b]">
                    <div className="max-w-7xl mx-auto px-6 text-center text-[#BABBB1] text-sm">
                        <p>© 2025 Azalea Language Project. Open Source under MIT License.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl bg-[#424658] border border-[#6C739C]/10 hover:border-[#ffc5cd]/30 hover:bg-[#424658]/80 transition-all hover:-translate-y-1 shadow-lg">
        <div className="mb-6 p-4 rounded-xl bg-[#2a2e3b] w-fit border border-[#6C739C]/20 shadow-inner">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-[#BABBB1] leading-relaxed">
            {description}
        </p>
    </div>
);
