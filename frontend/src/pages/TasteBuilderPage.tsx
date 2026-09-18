import React from 'react';
import { useTaste } from '../state/TasteContext';
import { useNavigate } from 'react-router-dom';
import { SelectionProgress } from '../features/taste/components/SelectionProgress';
import { SelectedMovieList } from '../features/taste/components/SelectedMovieList';
import { TasteSummary } from '../features/taste/components/TasteSummary';

export const TasteBuilderPage: React.FC = () => {
  const {
    selectedMovies,
    clearSelection,
    lastRemovedMovie,
    undoRemove,
    isValidSelection,
    loading,
    error,
  } = useTaste();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-amber-400">Your Taste Reel</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review your selected movies before generating personalized recommendations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedMovies.length > 0 && (
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded border border-red-500/20 transition-all"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => navigate('/discover')}
              className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-all"
            >
              + Add More Movies
            </button>
          </div>
        </div>

        {lastRemovedMovie && (
          <div className="bg-slate-900 border border-amber-500/40 p-3 rounded-lg flex items-center justify-between">
            <span className="text-sm text-slate-300">
              Removed <strong className="text-amber-300">{lastRemovedMovie.title}</strong>
            </span>
            <button
              onClick={undoRemove}
              className="text-xs font-bold text-amber-400 hover:underline px-3 py-1 bg-amber-500/10 rounded"
            >
              Undo Removal
            </button>
          </div>
        )}

        {loading && (
          <div role="status" className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
            Loading your saved taste reel...
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <SelectionProgress />
        <SelectedMovieList />
        <TasteSummary />

        <div className="flex justify-end pt-4">
          <button
            disabled={!isValidSelection || loading}
            onClick={() => navigate('/results')}
            className={`px-8 py-3.5 rounded-xl font-bold text-base transition-all ${
              isValidSelection
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xl shadow-amber-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            Generate Recommendations →
          </button>
        </div>
      </div>
    </div>
  );
};
