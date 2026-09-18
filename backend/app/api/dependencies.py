from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.supabase import InvalidAccessTokenError, SupabaseRequestError

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True, slots=True)
class CurrentUser:
    user_id: str
    email: str | None
    access_token: str


async def require_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> CurrentUser:
    if credentials is None or credentials.scheme.casefold() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A valid bearer token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    gateway = getattr(request.app.state, "supabase", None)
    if gateway is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

    try:
        payload = await gateway.get_user(credentials.credentials)
    except InvalidAccessTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The session is invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error
    except SupabaseRequestError as error:
        raise HTTPException(status_code=error.status_code, detail=error.detail) from error

    return CurrentUser(
        user_id=payload["id"],
        email=payload.get("email") if isinstance(payload.get("email"), str) else None,
        access_token=credentials.credentials,
    )


AuthenticatedUser = Annotated[CurrentUser, Depends(require_user)]
