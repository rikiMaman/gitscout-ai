import React from 'react';

export default function SearchBar({ username, setUsername, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="max-w-xl mx-auto mb-16 relative group px-4">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300 pointer-events-none" />
      <div className="relative flex gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-xl backdrop-blur-md">
        <div className="flex items-center pl-3 text-zinc-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          placeholder="Enter GitHub username to benchmark..."
          className="w-full bg-transparent border-0 py-2.5 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm rounded-lg transition-all shadow-md active:scale-98 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:scale-100 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-950 rounded-full animate-spin" />
              Reasoning...
            </div>
          ) : (
            'Analyze Profile'
          )}
        </button>
      </div>
    </form>
  );
}