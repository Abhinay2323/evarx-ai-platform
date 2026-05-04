"""Async SMTP email sender. Generic — works with any provider that exposes
SMTP (Resend, SendGrid, Postmark, AWS SES, Brevo, Mailgun, etc.)."""

from __future__ import annotations

from email.message import EmailMessage

import aiosmtplib
import structlog

from evarx_api.settings import get_settings

log = structlog.get_logger()


class EmailDisabled(Exception):
    """SMTP is not configured on the server."""


class EmailDeliveryError(Exception):
    """SMTP rejected the message."""


async def send_email(
    *,
    to: str,
    subject: str,
    text: str,
    html: str | None = None,
) -> None:
    """Send a single email. Raises EmailDisabled if SMTP isn't configured.

    Caller decides whether delivery failure is fatal. For best-effort sends
    (e.g. invite emails), wrap in try/except and log."""
    settings = get_settings()
    if not settings.smtp_configured:
        raise EmailDisabled("SMTP is not configured")

    msg = EmailMessage()
    msg["From"] = settings.smtp_from  # type: ignore[assignment]
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text)
    if html:
        msg.add_alternative(html, subtype="html")

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            start_tls=settings.smtp_use_tls and not settings.smtp_use_ssl,
            use_tls=settings.smtp_use_ssl,
            timeout=15.0,
        )
        log.info("email.sent", to=to, subject=subject)
    except Exception as e:
        log.warning("email.failed", to=to, error=str(e))
        raise EmailDeliveryError(str(e)) from e
