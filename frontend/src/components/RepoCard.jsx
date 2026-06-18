import React from 'react';

export default function RepoCard({ repo }) {
  const getBadgeStyles = (level) => {
    switch (level?.toLowerCase()) {
      case 'advanced':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
    }
  };

  return (
    <div className="group bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-6 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm">
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="font-bold text-base text-zinc-100 tracking-tight truncate group-hover:text-indigo-400 transition-colors">
            {repo.repo_name}
          </h3>
          <span className={`px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase rounded-full border ${getBadgeStyles(repo.level)}`}>
            {repo.level || 'Unknown'}
          </span>
        </div>
        <div className="text-zinc-400 text-sm leading-relaxed font-light whitespace-pre-line">
          {repo.assessment}
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-zinc-800/40 flex items-center justify-between text-xs text-zinc-500">
        <span>Architectural Insight</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">View Details →</span>
      </div>
    </div>
  );
}