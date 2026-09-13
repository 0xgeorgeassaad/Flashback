import React from 'react';
import { useTaste } from '../../../state/TasteContext';

export const TasteSummary: React.FC = () => {
  const { genreDistribution, selectedMovies } = useTaste();

  if (selectedMovies.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
      <h2 className="text-lg font-bold text-amber-400">Genre Taste Breakdown</h2>
      <div className="flex flex-wrap gap-2">
        {Object.entries(genreDistribution).map(([genre, count]) => (
          <div
            key={genre}
            className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"
          >
            <span className="text-slate-200 font-medium">{genre}</span>
            <span className="bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded text-[10px]">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};