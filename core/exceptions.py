from fastapi import Request
from fastapi.responses import JSONResponse

class APIException(Exception):
    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code

async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
