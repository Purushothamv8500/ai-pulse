"""Quick SMTP test for AI Pulse. Run: python test_email.py"""
import asyncio, sys, os
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import aiosmtplib
from app.core.config import settings

HTML = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#F8F7F4;">
  <div style="max-width:580px;margin:40px auto;background:white;border:1px solid #E7E5E0;padding:40px;">
    <p style="font-weight:700;font-size:18px;color:#1649FF;margin:0 0 4px;">AI Pulse</p>
    <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#A8A29E;margin:0 0 24px;">Email Delivery Test</p>
    <h1 style="font-size:22px;font-weight:700;color:#111110;margin:0 0 12px;">Your email is working.</h1>
    <p style="color:#57534E;font-size:14px;line-height:1.6;margin:0 0 24px;">
      SMTP is correctly configured. Daily briefings will be delivered to your inbox.
    </p>
    <div style="background:#F0FDF4;border:1px solid #A7F3D0;border-radius:4px;padding:16px;margin-bottom:32px;">
      <p style="color:#166534;font-size:13px;font-weight:600;margin:0 0 4px;">SMTP connection: OK</p>
      <p style="color:#166534;font-size:13px;font-weight:600;margin:0 0 4px;">Authentication: OK</p>
      <p style="color:#166534;font-size:13px;font-weight:600;margin:0;">Email delivery: OK</p>
    </div>
    <a href="http://localhost:3000/dashboard"
       style="background:#1649FF;color:white;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:600;">
      Open Dashboard
    </a>
  </div>
</body>
</html>"""


async def send_test():
    to = settings.SMTP_USERNAME
    print(f"\n{'='*52}")
    print("  AI Pulse - Email Delivery Test")
    print(f"{'='*52}")
    print(f"  SMTP Host : {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    print(f"  Username  : {settings.SMTP_USERNAME}")
    print(f"  From      : {settings.SMTP_FROM_EMAIL}")
    print(f"  To        : {to}")
    print(f"{'='*52}\n")

    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("ERROR: SMTP_USERNAME or SMTP_PASSWORD not set in .env")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "AI Pulse - Email Test"
    msg["From"] = f"{settings.SMTP_USERNAME}"   # use Gmail address as FROM
    msg["To"] = to
    msg.attach(MIMEText(HTML, "html"))

    try:
        print("Connecting to Gmail SMTP...")
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        print(f"SUCCESS - Email sent to {to}")
        print("Check your inbox (and spam folder).")
    except aiosmtplib.SMTPAuthenticationError:
        print("FAILED - Gmail rejected the password.")
        print("")
        print("CAUSE: Gmail App Password is invalid or expired.")
        print("")
        print("FIX - Generate a new App Password:")
        print("  1. Go to: https://myaccount.google.com/security")
        print("  2. Enable 2-Step Verification (if not already on)")
        print("  3. Go to: https://myaccount.google.com/apppasswords")
        print("  4. Create a new App Password (select 'Mail')")
        print("  5. Copy the 16-character password")
        print("  6. Paste it into SMTP_PASSWORD in backend/.env")
        print("  7. Run this test again")
    except Exception as e:
        print(f"FAILED - {type(e).__name__}: {e}")


if __name__ == "__main__":
    asyncio.run(send_test())
