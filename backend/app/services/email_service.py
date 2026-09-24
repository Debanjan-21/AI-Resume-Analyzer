import json
import smtplib
import urllib.error
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Tuple

from app.config.settings import (
    FRONTEND_URL,
    RESEND_API_KEY,
    SMTP_FROM_EMAIL,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
)


class EmailService:
    """
    Handles email notifications and password reset dispatches via Resend API or SMTP.
    """

    @staticmethod
    def send_password_reset_email(
        to_email: str,
        reset_token: str,
        recipient_name: str = "User",
    ) -> Tuple[bool, str]:
        """
        Sends a password reset email to the user.
        Returns (success: bool, reset_link: str).
        """
        base_url = (FRONTEND_URL or "http://localhost:3000").rstrip("/")
        reset_link = f"{base_url}/?reset_token={reset_token}"

        # Clean console log for audit
        print("\n" + "=" * 60)
        print(f"[RESET REQUEST] For user: {to_email}")
        print(f"[RESET LINK]: {reset_link}")
        print("=" * 60 + "\n")

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 40px 20px; }}
            .container {{ max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }}
            .brand {{ font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 24px; }}
            .brand span {{ color: #6366f1; }}
            h1 {{ font-size: 22px; color: #ffffff; margin-top: 0; }}
            p {{ font-size: 14px; line-height: 1.6; color: #94a3b8; }}
            .btn {{ display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin: 24px 0; text-align: center; }}
            .footer {{ font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">Resume<span>AI</span> Pro</div>
            <h1>Password Reset Request</h1>
            <p>Hello {recipient_name},</p>
            <p>We received a request to reset your password for your ResumeAI account. Click the button below to set a new password:</p>
            <div style="text-align: center;">
              <a href="{reset_link}" class="btn" target="_blank">Reset Password</a>
            </div>
            <p>This password reset link will expire in <strong>15 minutes</strong> for your security.</p>
            <p>If you did not request this password reset, you can safely ignore this email.</p>
            <div class="footer">
              AI Resume Analyzer • Intelligence for Job Seekers<br>
              If the button doesn't work, copy and paste this URL into your browser:<br>
              <span style="color: #6366f1; word-break: break-all;">{reset_link}</span>
            </div>
          </div>
        </body>
        </html>
        """

        text_content = (
            f"Hello {recipient_name},\n\n"
            f"Reset your ResumeAI password by opening the following link in your browser:\n"
            f"{reset_link}\n\n"
            f"This link expires in 15 minutes. If you did not request this, please ignore this email."
        )

        # ----------------------------------------------------
        # Method A: Resend API (Preferred & Recommended)
        # ----------------------------------------------------
        if RESEND_API_KEY and RESEND_API_KEY.strip():
            try:
                sender = SMTP_FROM_EMAIL or "ResumeAI <onboarding@resend.dev>"
                resend_payload = {
                    "from": sender,
                    "to": [to_email],
                    "subject": "Reset Your Password - ResumeAI",
                    "html": html_content,
                    "text": text_content,
                }
                req = urllib.request.Request(
                    "https://api.resend.com/emails",
                    data=json.dumps(resend_payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {RESEND_API_KEY.strip()}",
                        "Content-Type": "application/json",
                        "User-Agent": "ResumeAI-App",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=15) as resp:
                    resp_body = resp.read().decode("utf-8")
                    print(f"[SUCCESS] Password reset email dispatched to {to_email} via Resend: {resp_body}")
                    return True, reset_link

            except urllib.error.HTTPError as err:
                err_detail = err.read().decode("utf-8")
                print(f"[FAILED] Resend API error ({err.code}): {err_detail}")
                return False, reset_link
            except Exception as e:
                print(f"[FAILED] Error calling Resend API: {e}")
                return False, reset_link

        # ----------------------------------------------------
        # Method B: Standard SMTP Relay
        # ----------------------------------------------------
        if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
            print("[EMAIL NOTICE] Neither RESEND_API_KEY nor SMTP credentials configured in backend/.env.")
            return False, reset_link

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Reset Your Password - ResumeAI"
            from_addr = SMTP_FROM_EMAIL or SMTP_USER
            msg["From"] = f"ResumeAI <{from_addr}>"
            msg["To"] = to_email

            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(from_addr, [to_email], msg.as_string())

            print(f"[SUCCESS] Password reset email dispatched to {to_email} via SMTP.")
            return True, reset_link

        except Exception as e:
            print(f"[FAILED] Failed to send SMTP email to {to_email}: {e}")
            return False, reset_link
