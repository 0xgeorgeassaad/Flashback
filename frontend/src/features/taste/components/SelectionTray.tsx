import React, { useState } from 'react';
import { useTaste } from '../../../state/TasteContext';
import { useNavigate } from 'react-router-dom';

export const SelectionTray: React.FC = () => {
  const { selectedMovies, removeMovie, isValidSelection } = useTaste();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  if (selectedMovies.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-amber-500/30 text-white shadow-2xl z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              Selected Reel ({selectedMovies.length}/5 minimum)
            </h3>
            {!isValidSelection && (
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                Select {5 - selectedMovies.length} more
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-slate-400 hover:text-white underline md:hidden"
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>

        {!isCollapsed && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {selectedMovies.map((movie) => (
                <div
                  key={movie.movieId}
                  className="relative group flex-shrink-0 w-16 h-24 bg-slate-800 rounded overflow-hidden border border-slate-700"
                >
                  {movie.posterPath ? (
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/150x225?text=No+Poster';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-center p-1 bg-slate-800">
                      {movie.title}
                    </div>
                  )}
                  <button
                    onClick={() => removeMovie(movie.movieId)}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove movie"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              disabled={!isValidSelection}
              onClick={() => navigate('/taste')}
              className={`px-5 py-2.5 rounded font-bold text-sm flex-shrink-0 transition-all ${
                isValidSelection
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              Review & Get Recs →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};