"""Send a real verification email to a test address. Run: python test_verify_email.py"""
import asyncio, sys, os
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

from app.core.security import create_verification_token
from app.services.email_service import email_service
from app.core.config import settings

TARGET_EMAIL = "purushothamthulasi85@gmail.com"
TARGET_NAME  = "Purushotham"
FAKE_USER_ID = "test-user-00000000-0000-0000-0000"

async def main():
    print(f"\n{'='*54}")
    print("  AI Pulse — Verification Email Test")
    print(f"{'='*54}")
    print(f"  SMTP Host : {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    print(f"  Username  : {settings.SMTP_USERNAME}")
    print(f"  To        : {TARGET_EMAIL}")
    print(f"{'='*54}\n")

    token = create_verification_token(FAKE_USER_ID, TARGET_EMAIL)
    verify_url = f"{settings.FRONTEND_URL}/auth/verify-email?token={token}"
    print(f"Verification URL:\n  {verify_url}\n")

    print("Sending email...")
    ok = await email_service.send_verification_email(TARGET_EMAIL, TARGET_NAME, token)

    if ok:
        print("SUCCESS - Email sent!")
        print(f"Check inbox for: {TARGET_EMAIL}")
    else:
        print("FAILED - Check SMTP credentials.")
        print()
        print("The Gmail App Password is likely expired.")
        print("Fix:")
        print("  1. Go to https://myaccount.google.com/apppasswords")
        print("  2. Generate a new App Password (App: Mail)")
        print("  3. Update SMTP_PASSWORD in backend/.env")
        print("  4. Re-run this script")

if __name__ == "__main__":
    asyncio.run(main())
