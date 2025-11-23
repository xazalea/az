import React, { useState } from 'react';
import { Terminal, Code2, Play, Box, Layers, Cpu, Sparkles, ArrowRight, Github, BookOpen } from 'lucide-react';
import { Playground } from './Playground';

export const Landing: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-[#0D1117] text-white font-sans selection:bg-blue-500/30">
            {/* Navigation */}
            <nav className="border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50 bg-[#0D1117]/80">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="font-bold text-white text-lg">Az</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Azalea</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Documentation</a>
                        <a href="#" className="hover:text-white transition-colors">Examples</a>
                        <a href="https://github.com/xazalea/az" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                            <Github size={16} />
                            GitHub
                        </a>
                        <button 
                            onClick={onStart}
                            className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-1.5 rounded-md transition-all shadow-lg shadow-green-900/20 border border-white/10"
                        >
                            Try Playground
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main>
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                    
                    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
                                <Sparkles size={12} />
                                <span>v0.1.0 Public Preview</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI-Native</span><br />
                                Programming Language
                            </h1>
                            <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
                                Azalea integrates Large Language Models directly into the runtime. 
                                Write code that thinks, optimizes itself, and adapts to your intent.
                            </p>
                            
                            <div className="flex items-center justify-center gap-4">
                                <button 
                                    onClick={onStart}
                                    className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20"
                                >
                                    Start Coding
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all border border-gray-700">
                                    Read the Docs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-800/50">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<Cpu className="text-blue-400" />}
                            title="AI Primitives"
                            description="First-class support for AI operations. Use the 'ai' keyword to instruct models or optimize blocks at runtime."
                        />
                        <FeatureCard 
                            icon={<Layers className="text-purple-400" />}
                            title="Self-Healing Runtime"
                            description="Errors aren't just stack traces. The runtime analyzes failures and suggests fixes or patches itself on the fly."
                        />
                        <FeatureCard 
                            icon={<Code2 className="text-emerald-400" />}
                            title="Flexible Syntax"
                            description="Indentation-based, clean, and expressive. Azalea adapts to your coding style with ambiguous code interpretation."
                        />
                    </div>
                </div>

                {/* Code Showcase */}
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="flex items-center px-4 py-3 border-b border-gray-800 bg-[#0D1117]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <span className="ml-4 text-xs text-gray-500 font-mono">example.az</span>
                        </div>
                        <div className="p-8 overflow-x-auto">
                            <pre className="font-mono text-sm leading-relaxed">
                                <code className="block text-gray-300">
                                    <span className="text-purple-400">fn</span> <span className="text-blue-400">main</span>():{'\n'}
                                    {'    '}<span className="text-gray-500"># Native AI instructions</span>{'\n'}
                                    {'    '}<span className="text-purple-400">ai</span> <span className="text-green-400">"Create a responsive landing page layout"</span>{'\n'}
                                    {'\n'}
                                    {'    '}<span className="text-gray-500"># Standard UI primitives</span>{'\n'}
                                    {'    '}<span className="text-yellow-400">box</span>():{'\n'}
                                    {'        '}<span className="text-yellow-400">text</span>(<span className="text-green-400">"Welcome to the future"</span>){'\n'}
                                    {'        '}<span className="text-yellow-400">button</span>(<span className="text-green-400">"Deploy Agent"</span>){'\n'}
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-gray-800 py-12 bg-[#0D1117]">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
                    <p>© 2025 Azalea Language Project. Open Source under MIT License.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="p-6 rounded-xl bg-[#161b22] border border-gray-800 hover:border-gray-700 transition-colors">
        <div className="mb-4 p-3 rounded-lg bg-gray-900 w-fit border border-gray-800">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">
            {description}
        </p>
    </div>
);

