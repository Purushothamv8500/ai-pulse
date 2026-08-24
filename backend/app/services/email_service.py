import httpx
import aiosmtplib
import structlog
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = structlog.get_logger()

SMTP_TIMEOUT = 15  # seconds — prevents hanging when SMTP port is blocked


class EmailService:
    # ── Transport layer ───────────────────────────────────────────────────────

    async def _send_via_resend(self, to_email: str, to_name: str, subject: str, html: str) -> bool:
        """Send via Resend REST API (HTTPS/443 — works on all cloud providers)."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                    json={
                        "from": f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>",
                        "to": [to_email],
                        "subject": subject,
                        "html": html,
                    },
                )
            if resp.status_code in (200, 201):
                logger.info("email_sent_resend", to=to_email, subject=subject)
                return True
            logger.error("resend_api_error", status=resp.status_code, body=resp.text[:300])
            return False
        except Exception as exc:
            logger.error("resend_send_failed", to=to_email, error=str(exc))
            return False

    async def _send_via_smtp(self, to_email: str, to_name: str, subject: str, html: str) -> bool:
        """Send via SMTP (requires SMTP_USERNAME and SMTP_PASSWORD to be set)."""
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            logger.warning(
                "smtp_not_configured",
                hint="Set SMTP_USERNAME + SMTP_PASSWORD in Render env vars, or set RESEND_API_KEY",
            )
            return False
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = f"{to_name} <{to_email}>"
            msg.attach(MIMEText(html, "html"))
            use_ssl = settings.SMTP_PORT == 465
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
                use_tls=use_ssl,
                start_tls=not use_ssl,
                timeout=SMTP_TIMEOUT,
            )
            logger.info("email_sent_smtp", to=to_email, subject=subject)
            return True
        except Exception as exc:
            logger.error("smtp_send_failed", to=to_email, error=str(exc))
            return False

    async def _send(self, to_email: str, to_name: str, subject: str, html: str) -> bool:
        if settings.RESEND_API_KEY:
            ok = await self._send_via_resend(to_email, to_name, subject, html)
            if ok:
                return True
            logger.warning("resend_failed_falling_back_to_smtp")
        return await self._send_via_smtp(to_email, to_name, subject, html)

    # ── Email templates ───────────────────────────────────────────────────────

    async def send_verification_email(self, to_email: str, to_name: str, token: str) -> bool:
        verify_url = f"{settings.FRONTEND_URL}/auth/verify-email?token={token}"
        first_name = to_name.split()[0] if to_name else "there"
        html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F4;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E7E5E0;max-width:560px;width:100%;">
        <tr>
          <td style="padding:28px 40px 24px;border-bottom:1px solid #E7E5E0;">
            <span style="font-weight:800;font-size:15px;color:#1649FF;letter-spacing:-0.01em;">AI Pulse</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 32px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#A8A29E;">Action required</p>
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111110;letter-spacing:-0.02em;line-height:1.2;">
              Confirm your email address
            </h1>
            <p style="margin:0 0 24px;font-size:14px;color:#57534E;line-height:1.6;">
              Hi {first_name}, thanks for creating an AI Pulse account.<br>
              Click the button below to verify your email and activate your account.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1649FF;border-radius:6px;">
                  <a href="{verify_url}"
                     style="display:inline-block;padding:13px 28px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.01em;">
                    Confirm my account
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:#A8A29E;line-height:1.6;">
              This link expires in 24 hours. If you didn&rsquo;t create an AI Pulse account, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="border-top:1px solid #E7E5E0;padding-top:20px;">
              <p style="margin:0 0 4px;font-size:11px;color:#A8A29E;">Or copy this link into your browser:</p>
              <p style="margin:0;font-size:11px;color:#1649FF;word-break:break-all;">{verify_url}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #E7E5E0;background:#F8F7F4;">
            <p style="margin:0;font-size:11px;color:#A8A29E;">AI Pulse &mdash; Your daily AI intelligence briefing.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
        return await self._send(to_email, to_name, "Confirm your AI Pulse account", html)

    async def send_welcome_email(self, to_email: str, to_name: str) -> bool:
        """Sent to new users who sign up via Google OAuth."""
        first_name = to_name.split()[0] if to_name else "there"
        dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
        html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F4;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E7E5E0;max-width:560px;width:100%;">
        <tr>
          <td style="padding:28px 40px 24px;border-bottom:1px solid #E7E5E0;">
            <span style="font-weight:800;font-size:15px;color:#1649FF;letter-spacing:-0.01em;">AI Pulse</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 32px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#A8A29E;">Welcome</p>
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111110;letter-spacing:-0.02em;line-height:1.2;">
              Your AI Pulse account is ready
            </h1>
            <p style="margin:0 0 24px;font-size:14px;color:#57534E;line-height:1.6;">
              Hi {first_name}, you&rsquo;ve successfully signed in with Google.<br>
              Your AI Pulse account has been created and is ready to use.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#57534E;line-height:1.6;">
              Every morning you&rsquo;ll receive a personalised briefing covering the most important AI developments — curated and summarised just for you.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1649FF;border-radius:6px;">
                  <a href="{dashboard_url}"
                     style="display:inline-block;padding:13px 28px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.01em;">
                    Go to my dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #E7E5E0;background:#F8F7F4;">
            <p style="margin:0;font-size:11px;color:#A8A29E;">AI Pulse &mdash; Your daily AI intelligence briefing.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
        return await self._send(to_email, to_name, "Welcome to AI Pulse", html)

    async def send_password_reset_email(self, to_email: str, to_name: str, token: str) -> bool:
        reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
        first_name = to_name.split()[0] if to_name else "there"
        html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F4;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E7E5E0;max-width:560px;width:100%;">
        <tr>
          <td style="padding:28px 40px 24px;border-bottom:1px solid #E7E5E0;">
            <span style="font-weight:800;font-size:15px;color:#1649FF;letter-spacing:-0.01em;">AI Pulse</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 32px;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#A8A29E;">Password reset</p>
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111110;letter-spacing:-0.02em;line-height:1.2;">
              Reset your password
            </h1>
            <p style="margin:0 0 24px;font-size:14px;color:#57534E;line-height:1.6;">
              Hi {first_name}, we received a request to reset your password.<br>
              Click the button below to choose a new one.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1649FF;border-radius:6px;">
                  <a href="{reset_url}"
                     style="display:inline-block;padding:13px 28px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                    Reset my password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:#A8A29E;line-height:1.6;">
              This link expires in 1 hour. If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your account is secure.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="border-top:1px solid #E7E5E0;padding-top:20px;">
              <p style="margin:0 0 4px;font-size:11px;color:#A8A29E;">Or copy this link:</p>
              <p style="margin:0;font-size:11px;color:#1649FF;word-break:break-all;">{reset_url}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #E7E5E0;background:#F8F7F4;">
            <p style="margin:0;font-size:11px;color:#A8A29E;">AI Pulse &mdash; Your daily AI intelligence briefing.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
        return await self._send(to_email, to_name, "Reset your AI Pulse password", html)

    async def send_daily_briefing(self, to_email: str, to_name: str, briefing) -> bool:
        try:
            from app.models.briefing import Briefing
            from jinja2 import Environment, FileSystemLoader, select_autoescape
            from pathlib import Path
            TEMPLATE_DIR = Path(__file__).parent.parent / "email_templates"
            jinja_env = Environment(
                loader=FileSystemLoader(str(TEMPLATE_DIR)),
                autoescape=select_autoescape(["html"]),
            )
            subject = f"AI Pulse — {briefing.date.strftime('%B %d, %Y')}"
            try:
                template = jinja_env.get_template("daily_briefing.html")
                html_content = template.render(
                    user_name=to_name,
                    briefing=briefing,
                    frontend_url=settings.FRONTEND_URL,
                )
            except Exception:
                html_content = self._fallback_briefing_html(to_name, briefing)
            return await self._send(to_email, to_name, subject, html_content)
        except Exception as exc:
            logger.error("briefing_email_failed", to=to_email, error=str(exc))
            return False

    def _fallback_briefing_html(self, to_name: str, briefing) -> str:
        items_html = ""
        for item in briefing.items:
            items_html += f"""
            <div style="margin-bottom:24px;padding:20px;border-left:4px solid #1649FF;">
              <h3 style="margin:0 0 8px;font-size:18px;">{item.article.title}</h3>
              <p style="margin:0 0 8px;color:#374151;">{item.summary or ''}</p>
              <p style="margin:0 0 8px;color:#1649FF;"><strong>Why it matters:</strong> {item.why_it_matters or ''}</p>
              <a href="{item.article.url}" style="color:#1649FF;">Read original &rarr;</a>
            </div>
            """
        return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>AI Pulse Daily Brief</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#F8F7F4;">
  <div style="background:white;padding:32px;border:1px solid #E7E5E0;">
    <h1 style="color:#1649FF;margin:0 0 4px;font-size:18px;">AI Pulse</h1>
    <p style="color:#6b7280;margin:0 0 24px;font-size:13px;">{briefing.date.strftime('%A, %B %d, %Y')}</p>
    <p>Hello {to_name},</p>
    <p>{briefing.greeting or ''}</p>
    <h2 style="border-bottom:2px solid #E7E5E0;padding-bottom:8px;">Today's Top AI Developments</h2>
    {items_html}
    <div style="text-align:center;margin-top:32px;">
      <a href="{settings.FRONTEND_URL}/dashboard" style="background:#1649FF;color:white;padding:12px 24px;text-decoration:none;font-weight:700;">View in Dashboard &rarr;</a>
    </div>
  </div>
</body>
</html>"""


email_service = EmailService()
