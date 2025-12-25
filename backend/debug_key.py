from app.config.settings import settings
import os

print(f"DEBUG: GOOGLE_API_KEY is {'set' if settings.GOOGLE_API_KEY else 'NOT set'}")
if settings.GOOGLE_API_KEY:
    print(f"DEBUG: Key starts with: {settings.GOOGLE_API_KEY[:4]}...")
