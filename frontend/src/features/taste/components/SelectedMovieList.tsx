import React from 'react';
import { useTaste } from '../../../state/TasteContext';
import { useNavigate } from 'react-router-dom';
import { posterUrl } from '../../../lib/posters';

export const SelectedMovieList: React.FC = () => {
  const { selectedMovies, removeMovie } = useTaste();
  const navigate = useNavigate();

  if (selectedMovies.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
        <p className="text-slate-400 text-lg">Your taste reel is empty.</p>
        <button
          onClick={() => navigate('/discover')}
          className="mt-4 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400 transition-all"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {selectedMovies.map((movie) => (
        <div
          key={movie.movieId}
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-amber-500/50 transition-all flex flex-col"
        >
          <div className="h-56 bg-slate-800 relative overflow-hidden">
            {movie.posterPath ? (
              <img
                src={movie.posterPath}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/200x300?text=No+Poster';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-3 text-xs text-center text-slate-400">
                {movie.title}
              </div>
            )}
            <button
              onClick={() => removeMovie(movie.movieId)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all"
              title="Remove"
            >
              ×
            </button>
          </div>
          <div className="p-3 flex-1 flex flex-col justify-between">
            <h3 className="font-semibold text-sm line-clamp-1 text-slate-200">
              {movie.title}
            </h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};