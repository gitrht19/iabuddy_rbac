from django.contrib.auth import get_user_model
from rest_framework import serializers

from access_control.models import RolePermission

from .models import Audit


User = get_user_model()


def validate_auditor_user(user):

    if user is None:
        return None

    has_audit_assignment_permission = (
        RolePermission.objects.filter(
            role__user_roles__user=user,
            role__is_active=True,
            permission__is_active=True,
            permission__code="audit.assign",
        ).exists()
    )

    if not has_audit_assignment_permission:

        raise serializers.ValidationError(
            "Selected user is not eligible for audit assignment."
        )

    return user


class AuditListSerializer(
    serializers.ModelSerializer
):

    created_by_email = serializers.EmailField(
        source="created_by.email",
        read_only=True
    )

    assigned_auditor_email = serializers.EmailField(
        source="assigned_auditor.email",
        read_only=True
    )

    class Meta:

        model = Audit

        fields = [
            "id",
            "title",
            "description",
            "status",
            "created_by_email",
            "assigned_auditor_email",
            "created_at",
            "updated_at",
        ]


class CreateAuditSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Audit

        fields = [
            "title",
            "description",
            "assigned_auditor",
        ]

    def validate_title(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Audit title cannot be empty."
            )

        return value

    def validate_assigned_auditor(self, value):

        return validate_auditor_user(value)


class UpdateAuditSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Audit

        fields = [
            "title",
            "description",
            "assigned_auditor",
        ]

    def validate_title(self, value):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Audit title cannot be empty."
            )

        return value

    def validate_assigned_auditor(self, value):

        return validate_auditor_user(value)


class AuditDetailSerializer(
    serializers.ModelSerializer
):

    created_by_email = serializers.EmailField(
        source="created_by.email",
        read_only=True
    )

    assigned_auditor_email = serializers.EmailField(
        source="assigned_auditor.email",
        read_only=True
    )

    reviewed_by_email = serializers.EmailField(
        source="reviewed_by.email",
        read_only=True
    )

    approved_by_email = serializers.EmailField(
        source="approved_by.email",
        read_only=True
    )

    class Meta:

        model = Audit

        fields = [
            "id",
            "title",
            "description",
            "status",
            "created_by_email",
            "assigned_auditor_email",
            "reviewed_by_email",
            "approved_by_email",
            "created_at",
            "updated_at",
        ]