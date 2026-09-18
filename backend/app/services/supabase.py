from __future__ import annotations

from typing import Any

import httpx


class InvalidAccessTokenError(Exception):
    pass


class SupabaseRequestError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class SupabaseGateway:
    def __init__(self, url: str, publishable_key: str) -> None:
        self.url = url.rstrip("/")
        self.publishable_key = publishable_key
        self.client = httpx.AsyncClient(timeout=15.0)

    async def close(self) -> None:
        await self.client.aclose()

    def _headers(self, access_token: str) -> dict[str, str]:
        return {
            "apikey": self.publishable_key,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

    async def get_user(self, access_token: str) -> dict[str, Any]:
        try:
            response = await self.client.get(
                f"{self.url}/auth/v1/user",
                headers=self._headers(access_token),
            )
        except httpx.HTTPError as error:
            raise SupabaseRequestError(503, "Authentication service is unavailable") from error

        if response.status_code in {401, 403}:
            raise InvalidAccessTokenError from None
        if response.is_error:
            raise SupabaseRequestError(
                503,
                "Authentication service could not verify the session",
            )
        payload = response.json()
        if not isinstance(payload, dict) or not isinstance(payload.get("id"), str):
            raise SupabaseRequestError(503, "Authentication service returned invalid data")
        return payload

    async def data_request(
        self,
        method: str,
        table: str,
        access_token: str,
        *,
        params: dict[str, str] | None = None,
        payload: Any = None,
        prefer: str | None = None,
    ) -> Any:
        headers = self._headers(access_token)
        if prefer:
            headers["Prefer"] = prefer
        try:
            response = await self.client.request(
                method,
                f"{self.url}/rest/v1/{table}",
                headers=headers,
                params=params,
                json=payload,
            )
        except httpx.HTTPError as error:
            raise SupabaseRequestError(503, "Account data service is unavailable") from error

        if response.status_code in {401, 403}:
            raise InvalidAccessTokenError from None
        if response.is_error:
            detail = "Account data service rejected the request"
            try:
                body = response.json()
                if isinstance(body, dict) and isinstance(body.get("message"), str):
                    detail = body["message"]
            except ValueError:
                pass
            raise SupabaseRequestError(502, detail)
        if not response.content:
            return None
        return response.json()
