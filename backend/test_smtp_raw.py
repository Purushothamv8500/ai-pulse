"""Raw SMTP test — no app config involved."""
import asyncio, sys
sys.stdout.reconfigure(encoding="utf-8")
import aiosmtplib
from email.mime.text import MIMEText

SMTP_HOST     = "smtp.gmail.com"
SMTP_PORT     = 587
SMTP_USERNAME = "noreplaypulse.ai@gmail.com"
SMTP_PASSWORD = "xubhhiiracsssybd"
TO_EMAIL      = "purushothamthulasi85@gmail.com"

async def main():
    print(f"Username : {SMTP_USERNAME}")
    print(f"Password : {SMTP_PASSWORD!r}  (length={len(SMTP_PASSWORD)})")
    print(f"To       : {TO_EMAIL}")
    print("Connecting...")

    msg = MIMEText("<b>AI Pulse SMTP test passed.</b>", "html")
    msg["Subject"] = "AI Pulse - SMTP raw test"
    msg["From"] = SMTP_USERNAME
    msg["To"] = TO_EMAIL

    try:
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
            start_tls=True,
        )
        print("SUCCESS - email sent!")
    except aiosmtplib.SMTPAuthenticationError as e:
        print(f"AUTH FAILED: {e}")
        print()
        print("The app password is wrong. Steps:")
        print("  1. Go to https://myaccount.google.com/apppasswords")
        print("  2. DELETE the current AI Pulse app password")
        print("  3. Create a NEW one")
        print("  4. Copy all 16 characters (no spaces)")
        print("  5. Update SMTP_PASSWORD in this file and in backend/.env")
    except Exception as e:
        print(f"OTHER ERROR: {type(e).__name__}: {e}")

asyncio.run(main())
