import React from 'react';
import { useTaste } from '../../../state/TasteContext';

export const SelectionProgress: React.FC = () => {
  const { selectedMovies, isValidSelection } = useTaste();

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <span className="text-sm font-semibold text-slate-300">
          Selection Status: {selectedMovies.length} / 5 Minimum
        </span>
        <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden max-w-md">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${Math.min((selectedMovies.length / 5) * 100, 100)}%` }}
          />
        </div>
      </div>
      {!isValidSelection && (
        <p className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded border border-amber-500/20">
          Please select at least {5 - selectedMovies.length} more movie(s) to continue.
        </p>
      )}
    </div>
  );
};