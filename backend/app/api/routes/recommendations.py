from fastapi import APIRouter, HTTPException, Request, status

from app.api.dependencies import AuthenticatedUser
from app.schemas.movies import RecommendationsResponse
from app.schemas.recommendations import RecommendRequest
from app.services.errors import UnknownMovieError

router = APIRouter(tags=["recommendations"])


@router.post("/recommend", response_model=RecommendationsResponse)
def recommend(
    payload: RecommendRequest,
    request: Request,
    _user: AuthenticatedUser,
) -> RecommendationsResponse:
    settings = request.app.state.settings
    try:
        recommendations = request.app.state.recommender.recommend(
            [movie.movie_id for movie in payload.movies],
            settings.recommendation_count,
        )
    except UnknownMovieError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "message": "One or more movies are not in the recommendation catalog",
                "movieIds": error.movie_ids,
            },
        ) from error
    return RecommendationsResponse(recommendations=recommendations)
