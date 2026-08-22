from django.conf import settings
from django.db import models


class Audit(models.Model):

    class Status(models.TextChoices):

        DRAFT = "draft", "Draft"

        IN_PROGRESS = (
            "in_progress",
            "In Progress"
        )

        UNDER_REVIEW = (
            "under_review",
            "Under Review"
        )

        APPROVED = "approved", "Approved"

        REJECTED = "rejected", "Rejected"


    title = models.CharField(
        max_length=200
    )

    description = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.DRAFT
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_audits"
    )

    assigned_auditor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="assigned_audits",
        null=True,
        blank=True
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reviewed_audits",
        null=True,
        blank=True
    )

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="approved_audits",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        return self.title