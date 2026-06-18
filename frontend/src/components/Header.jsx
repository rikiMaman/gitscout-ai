import React from 'react';

export default function Header() {
  return (
    <header className="text-center mb-12 relative animate-fade-in">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4 backdrop-blur-sm">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Autonomous Agent Active (v4.0)
      </div>
      <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent mb-3">
        GitScout <span className="text-indigo-500">AI</span>
      </h1>
      <p className="text-zinc-400 text-base max-w-md mx-auto font-light leading-relaxed">
        Deep LLM evaluation of repository patterns, code structure, and architectural integrity.
      </p>
    </header>
  );
}