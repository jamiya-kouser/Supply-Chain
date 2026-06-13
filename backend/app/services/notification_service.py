"""
Notification service — email, SMS, and alert dispatch pipeline.

Every notification is logged into the `notifications_log` MongoDB collection.
"""

from datetime import datetime
from typing import Optional, Dict, Any
import logging
import uuid
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import get_settings
from app.database.collections import get_notifications_collection
from app.models.notification import NotificationType, NotificationStatus

logger = logging.getLogger(__name__)
settings = get_settings()


class NotificationService:
    """Handles email, SMS, exception alerts, and ETA updates."""

    # ── Internal: persist log ────────────────────────────

    async def _log_notification(
        self,
        notif_type: NotificationType,
        recipient: str,
        body: str,
        subject: Optional[str] = None,
        status: NotificationStatus = NotificationStatus.PENDING,
        metadata: Dict[str, Any] | None = None,
        error: Optional[str] = None,
    ) -> str:
        """Write a notification record to MongoDB and return its ID."""
        collection = get_notifications_collection()
        notif_id = f"NOTIF-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.utcnow()

        doc = {
            "notification_id": notif_id,
            "type": notif_type.value,
            "status": status.value,
            "recipient": recipient,
            "subject": subject,
            "body": body,
            "metadata": metadata or {},
            "error": error,
            "created_at": now,
            "sent_at": now if status == NotificationStatus.SENT else None,
        }
        await collection.insert_one(doc)
        return notif_id

    async def _mark_sent(self, notif_id: str) -> None:
        collection = get_notifications_collection()
        await collection.update_one(
            {"notification_id": notif_id},
            {"$set": {"status": "sent", "sent_at": datetime.utcnow()}},
        )

    async def _mark_failed(self, notif_id: str, error: str) -> None:
        collection = get_notifications_collection()
        await collection.update_one(
            {"notification_id": notif_id},
            {"$set": {"status": "failed", "error": error}},
        )

    # ── Email ────────────────────────────────────────────

    async def send_email(
        self,
        recipient: str,
        subject: str,
        body: str,
        metadata: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """Send an email and log the result."""
        notif_id = await self._log_notification(
            notif_type=NotificationType.EMAIL,
            recipient=recipient,
            subject=subject,
            body=body,
            metadata=metadata,
        )

        try:
            message = MIMEMultipart()
            message["From"] = settings.SMTP_USER
            message["To"] = recipient
            message["Subject"] = subject
            message.attach(MIMEText(body, "html"))

            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=True,
            )

            await self._mark_sent(notif_id)
            logger.info("Email sent → %s (id=%s)", recipient, notif_id)
            return {"success": True, "notification_id": notif_id}

        except Exception as exc:
            error_msg = str(exc)
            await self._mark_failed(notif_id, error_msg)
            logger.error("Email failed → %s: %s", recipient, error_msg)
            return {"success": False, "notification_id": notif_id, "error": error_msg}

    # ── SMS ──────────────────────────────────────────────

    async def send_sms(
        self,
        recipient: str,
        body: str,
        metadata: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """
        Send an SMS message via configured provider.
        Currently logs the intent; replace the inner block with your
        SMS gateway (Twilio, MSG91, etc.) integration.
        """
        notif_id = await self._log_notification(
            notif_type=NotificationType.SMS,
            recipient=recipient,
            body=body,
            metadata=metadata,
        )

        try:
            # ── Placeholder: integrate your SMS gateway here ──
            # e.g. await twilio_client.messages.create(...)
            logger.info("SMS dispatched → %s (id=%s)", recipient, notif_id)
            await self._mark_sent(notif_id)
            return {"success": True, "notification_id": notif_id}

        except Exception as exc:
            error_msg = str(exc)
            await self._mark_failed(notif_id, error_msg)
            logger.error("SMS failed → %s: %s", recipient, error_msg)
            return {"success": False, "notification_id": notif_id, "error": error_msg}

    # ── Exception Alerts ─────────────────────────────────

    async def dispatch_exception_alerts(
        self,
        shipment_id: str,
        exception_type: str,
        description: str,
        recipients: list[str],
        metadata: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """
        Broadcast exception alerts (delay, damage, loss, etc.) to
        all relevant stakeholders via email.
        """
        subject = f"⚠️ Supply Chain Alert — {exception_type} on shipment {shipment_id}"
        body = (
            f"<h2>Exception Alert</h2>"
            f"<p><strong>Shipment:</strong> {shipment_id}</p>"
            f"<p><strong>Type:</strong> {exception_type}</p>"
            f"<p><strong>Details:</strong> {description}</p>"
            f"<p>Please take immediate action.</p>"
        )

        results = []
        for recipient in recipients:
            result = await self.send_email(
                recipient=recipient,
                subject=subject,
                body=body,
                metadata={
                    "alert_type": "exception",
                    "shipment_id": shipment_id,
                    "exception_type": exception_type,
                    **(metadata or {}),
                },
            )
            results.append(result)

        return {
            "shipment_id": shipment_id,
            "exception_type": exception_type,
            "recipients_count": len(recipients),
            "results": results,
        }

    # ── ETA Updates ──────────────────────────────────────

    async def dispatch_eta_update(
        self,
        shipment_id: str,
        old_eta: str,
        new_eta: str,
        reason: str,
        recipients: list[str],
        metadata: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        """
        Notify stakeholders about an ETA change for a shipment.
        Sends both email and logs SMS intent.
        """
        subject = f"🕐 ETA Update — Shipment {shipment_id}"
        body = (
            f"<h2>ETA Update</h2>"
            f"<p><strong>Shipment:</strong> {shipment_id}</p>"
            f"<p><strong>Previous ETA:</strong> {old_eta}</p>"
            f"<p><strong>New ETA:</strong> {new_eta}</p>"
            f"<p><strong>Reason:</strong> {reason}</p>"
        )
        sms_body = (
            f"ETA Update: Shipment {shipment_id} now expected at {new_eta} "
            f"(was {old_eta}). Reason: {reason}"
        )

        results = []
        for recipient in recipients:
            # Send email
            email_result = await self.send_email(
                recipient=recipient,
                subject=subject,
                body=body,
                metadata={
                    "alert_type": "eta_update",
                    "shipment_id": shipment_id,
                    **(metadata or {}),
                },
            )
            results.append(email_result)

            # Also send SMS
            sms_result = await self.send_sms(
                recipient=recipient,
                body=sms_body,
                metadata={
                    "alert_type": "eta_update",
                    "shipment_id": shipment_id,
                    **(metadata or {}),
                },
            )
            results.append(sms_result)

        return {
            "shipment_id": shipment_id,
            "old_eta": old_eta,
            "new_eta": new_eta,
            "recipients_count": len(recipients),
            "results": results,
        }


# Module-level singleton
notification_service = NotificationService()
