from fastapi import HTTPException, status


class APIError(HTTPException):
    """Base for our domain errors. Subclass with a sensible status_code."""


class NotFoundError(APIError):
    def __init__(self, what: str = "Resource") -> None:
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{what} not found")


class ForbiddenError(APIError):
    def __init__(self, detail: str = "Forbidden") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthorizedError(APIError):
    def __init__(self, detail: str = "Not authenticated") -> None:
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)
