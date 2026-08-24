from fastapi import APIRouter
from app.api.v1 import auth, users, briefings, articles, learning, admin

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(briefings.router)
router.include_router(articles.router)
router.include_router(learning.router)
router.include_router(admin.router)
