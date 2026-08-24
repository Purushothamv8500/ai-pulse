import aiosmtplib
import structlog
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
from app.core.config import settings
from app.models.briefing import Briefing

logger = structlog.get_logger()

TEMPLATE_DIR = Path(__file__).parent.parent / "email_templates"
jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html"]),
)


class EmailService:
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

        <!-- Header -->
        <tr>
          <td style="padding:28px 40px 24px;border-bottom:1px solid #E7E5E0;">
            <span style="font-weight:800;font-size:15px;color:#1649FF;letter-spacing:-0.01em;">AI Pulse</span>
          </td>
        </tr>

        <!-- Body -->
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
              This link expires in 24 hours. If you didn't create an AI Pulse account, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- Divider + link fallback -->
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="border-top:1px solid #E7E5E0;padding-top:20px;">
              <p style="margin:0 0 4px;font-size:11px;color:#A8A29E;">Or copy this link into your browser:</p>
              <p style="margin:0;font-size:11px;color:#1649FF;word-break:break-all;">{verify_url}</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #E7E5E0;background:#F8F7F4;">
            <p style="margin:0;font-size:11px;color:#A8A29E;">
              AI Pulse &mdash; Your daily AI intelligence briefing.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""
        try:
            subject = "Confirm your AI Pulse account"
            await self._send(to_email, to_name, subject, html)
            logger.info("verification_email_sent", to=to_email)
            return True
        except Exception as e:
            logger.error("verification_email_failed", to=to_email, error=str(e))
            return False

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
              This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your account is secure.
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
        try:
            await self._send(to_email, to_name, "Reset your AI Pulse password", html)
            logger.info("reset_email_sent", to=to_email)
            return True
        except Exception as e:
            logger.error("reset_email_failed", to=to_email, error=str(e))
            return False

    async def send_daily_briefing(
        self, to_email: str, to_name: str, briefing: Briefing
    ) -> bool:
        try:
            subject = f"AI Pulse — {briefing.date.strftime('%B %d, %Y')}"
            html_content = self._render_briefing_email(to_name, briefing)
            await self._send(to_email, to_name, subject, html_content)
            logger.info("email_sent", to=to_email, briefing_date=str(briefing.date))
            return True
        except Exception as e:
            logger.error("email_failed", to=to_email, error=str(e))
            return False

    def _render_briefing_email(self, to_name: str, briefing: Briefing) -> str:
        try:
            template = jinja_env.get_template("daily_briefing.html")
            return template.render(
                user_name=to_name,
                briefing=briefing,
                frontend_url=settings.FRONTEND_URL,
            )
        except Exception:
            return self._fallback_email(to_name, briefing)

    def _fallback_email(self, to_name: str, briefing: Briefing) -> str:
        items_html = ""
        for item in briefing.items:
            items_html += f"""
            <div style="margin-bottom:24px;padding:20px;border-left:4px solid #6366f1;">
              <h3 style="margin:0 0 8px;font-size:18px;">{item.article.title}</h3>
              <p style="margin:0 0 8px;color:#374151;">{item.summary or ''}</p>
              <p style="margin:0 0 8px;color:#6366f1;"><strong>Why it matters:</strong> {item.why_it_matters or ''}</p>
              <a href="{item.article.url}" style="color:#6366f1;">Read original →</a>
            </div>
            """

        return f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>AI Pulse Daily Brief</title></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;">
          <div style="background:white;padding:32px;border-radius:12px;">
            <h1 style="color:#6366f1;margin:0 0 4px;">AI Pulse</h1>
            <p style="color:#6b7280;margin:0 0 24px;">{briefing.date.strftime('%A, %B %d, %Y')}</p>
            <p>Hello {to_name},</p>
            <p>{briefing.greeting or ''}</p>
            <h2 style="border-bottom:2px solid #e5e7eb;padding-bottom:8px;">Today's Top AI Developments</h2>
            {items_html}
            {"<h2>Today's Learning Recommendation</h2><p><strong>" + briefing.learning_topic + "</strong></p><p>" + (briefing.learning_why or '') + "</p>" if briefing.learning_topic else ""}
            <div style="text-align:center;margin-top:32px;">
              <a href="{settings.FRONTEND_URL}/dashboard" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">View in Dashboard →</a>
            </div>
          </div>
        </body>
        </html>
        """

    async def _send(
        self, to_email: str, to_name: str, subject: str, html_content: str
    ) -> None:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = f"{to_name} <{to_email}>"
        msg.attach(MIMEText(html_content, "html"))

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )


email_service = EmailService()
