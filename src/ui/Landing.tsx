import React, { useState } from 'react';
import { Code2, Layers, Cpu, Sparkles, ArrowRight, Github, Package, Terminal, Search, Zap, Database } from 'lucide-react';

export const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const [version] = useState('v1.0.0 AI-Native');

    return (
        <div className="min-h-screen bg-[#424658] text-[#F0DAD5] font-sans selection:bg-[#ffc5cd]/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="border-b border-[#6C739C]/20 backdrop-blur-lg sticky top-0 z-50 bg-[#424658]/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#ffc5cd] to-[#6C739C] rounded-xl flex items-center justify-center shadow-lg shadow-[#ffc5cd]/20">
                            <span className="font-bold text-[#424658] text-xl">Az</span>
                        </div>
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
                        <h2 className="text-4xl font-bold text-center mb-16 text-white">AI Built into the Syntax</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={<Terminal className="text-[#ffc5cd]" />}
                                title="Agent Loops"
                                description="Define autonomous agents with the 'agent' keyword. The runtime manages their memory and execution loop."
                            />
                            <FeatureCard 
                                icon={<Search className="text-[#6C739C]" />}
                                title="Semantic RAG"
                                description="Native 'rag' command to perform vector search on your codebase or documentation instantly."
                            />
                            <FeatureCard 
                                icon={<Zap className="text-[#F0DAD5]" />}
                                title="Auto-Import"
                                description="Import libraries that don't exist yet. The AI compiler generates them on the fly based on usage."
                            />
                            <FeatureCard 
                                icon={<Layers className="text-[#ffc5cd]" />}
                                title="Macros"
                                description="Compile-time AI expansion. Describe what you want, and the compiler writes the boilerplate."
                            />
                            <FeatureCard 
                                icon={<Database className="text-[#6C739C]" />}
                                title="Data Inspector"
                                description="Runtime 'inspect()' uses AI to explain complex data structures and suggest manipulations."
                            />
                            <FeatureCard 
                                icon={<Cpu className="text-[#F0DAD5]" />}
                                title="Self-Healing"
                                description="Runtime errors trigger an AI analysis pass that can auto-patch the running code."
                            />
                        </div>
                    </div>
                </div>

                {/* Ecosystem Section */}
                <div id="ecosystem" className="py-24 max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16 text-white">Professional Ecosystem</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* VS Code */}
                        <div className="bg-[#2a2e3b] p-8 rounded-2xl border border-[#6C739C]/20 hover:border-[#ffc5cd]/50 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-white">VS Code Extension</h3>
                                <Code2 size={32} className="text-[#007ACC]" />
                            </div>
                            <p className="text-[#BABBB1] mb-6">
                                Full syntax highlighting, AI-powered intellisense, and inline execution.
                            </p>
                            <button className="w-full py-3 bg-[#424658] hover:bg-[#6C739C] rounded-lg text-white font-medium transition-colors">
                                Install Extension
                            </button>
                        </div>

                        {/* NPM */}
                        <div className="bg-[#2a2e3b] p-8 rounded-2xl border border-[#6C739C]/20 hover:border-[#ffc5cd]/50 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-white">NPM Package</h3>
                                <Package size={32} className="text-[#CB3837]" />
                            </div>
                            <p className="text-[#BABBB1] mb-6">
                                Lightweight CLI tool. Compile, run, and manage Azalea projects from any terminal.
                            </p>
                            <div className="flex gap-4">
                                <button className="flex-1 py-3 bg-[#424658] hover:bg-[#6C739C] rounded-lg text-white font-medium transition-colors">
                                    View on NPM
                                </button>
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
