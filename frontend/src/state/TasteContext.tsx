/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Movie, SelectedMoviePayload } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants';
import { isMovieArray } from '../lib/guards';

const EMPTY_TASTE: Movie[] = [];
const TASTE_STORAGE_OPTIONS = { validate: isMovieArray };
interface TasteContextType {
  selectedMovies: Movie[];
  addMovie: (movie: Movie) => void;
  removeMovie: (movieId: number) => void;
  toggleMovie: (movie: Movie) => void;
  replaceSelection: (movies: Movie[]) => void;
  clearSelection: () => void;
  lastRemovedMovie: Movie | null;
  undoRemove: () => void;
  genreDistribution: Record<string, number>;
  isValidSelection: boolean;
  recommendationPayload: SelectedMoviePayload[];
}

const TasteContext = createContext<TasteContextType | undefined>(undefined);

export const TasteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Keep the persisted draft under the shared application storage key.
  const [rawSelectedMovies, setSelectedMovies] = useLocalStorage<Movie[]>(
    STORAGE_KEYS.tasteDraft,
    EMPTY_TASTE,
    TASTE_STORAGE_OPTIONS,
  );

  // Fall back safely if local storage contains an unexpected value.
  const selectedMovies = useMemo(() => {
    return Array.isArray(rawSelectedMovies) ? rawSelectedMovies : [];
  }, [rawSelectedMovies]);

  const [lastRemovedMovie, setLastRemovedMovie] = useState<Movie | null>(null);

  const addMovie = (movie: Movie) => {
    if (!selectedMovies.some((m) => m.movieId === movie.movieId)) {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  const removeMovie = (movieId: number) => {
    const movieToRemove = selectedMovies.find((m) => m.movieId === movieId);
    if (movieToRemove) {
      setLastRemovedMovie(movieToRemove);
      setSelectedMovies(selectedMovies.filter((m) => m.movieId !== movieId));
    }
  };

  const toggleMovie = (movie: Movie) => {
    if (selectedMovies.some((m) => m.movieId === movie.movieId)) {
      removeMovie(movie.movieId);
    } else {
      addMovie(movie);
    }
  };

  const clearSelection = () => {
    setSelectedMovies([]);
  };

  const replaceSelection = (movies: Movie[]) => {
    const uniqueMovies = movies.filter(
      (movie, index) => movies.findIndex((candidate) => candidate.movieId === movie.movieId) === index,
    );
    setSelectedMovies(uniqueMovies);
  };

  const undoRemove = () => {
    if (lastRemovedMovie) {
      addMovie(lastRemovedMovie);
      setLastRemovedMovie(null);
    }
  };

  const genreDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedMovies.forEach((movie) => {
      movie.genres?.forEach((genre) => {
        counts[genre] = (counts[genre] || 0) + 1;
      });
    });
    return counts;
  }, [selectedMovies]);

  const isValidSelection = selectedMovies.length >= 5;

  const recommendationPayload: SelectedMoviePayload[] = useMemo(() => {
    return selectedMovies.map((movie) => ({
      movieId: movie.movieId,
      rating: 5,
    }));
  }, [selectedMovies]);

  return (
    <TasteContext.Provider
      value={{
        selectedMovies,
        addMovie,
        removeMovie,
        toggleMovie,
        replaceSelection,
        clearSelection,
        lastRemovedMovie,
        undoRemove,
        genreDistribution,
        isValidSelection,
        recommendationPayload,
      }}
    >
      {children}
    </TasteContext.Provider>
  );
};

export const useTaste = () => {
  const context = useContext(TasteContext);
  if (!context) {
    throw new Error('useTaste must be used within a TasteProvider');
  }
  return context;
};
