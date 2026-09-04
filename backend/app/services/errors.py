class UnknownMovieError(ValueError):
    def __init__(self, movie_ids: list[int]) -> None:
        self.movie_ids = movie_ids
        super().__init__(f"Unknown or unsupported movie IDs: {movie_ids}")
