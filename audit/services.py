from rest_framework.exceptions import ValidationError

from access_control.models import RolePermission

from .models import Audit


def validate_audit_assignee(user):

    if user is None:
        return None

    is_eligible = RolePermission.objects.filter(
        role__user_roles__user=user,
        role__is_active=True,
        permission__is_active=True,
        permission__code="audit.assign",
    ).exists()

    if not is_eligible:

        raise ValidationError(
            "Selected user is not eligible for audit assignment."
        )

    return user


def create_audit(
    title,
    description="",
    created_by=None,
    assigned_auditor=None
):

    assigned_auditor = validate_audit_assignee(
        assigned_auditor
    )

    audit = Audit.objects.create(
        title=title,
        description=description,
        created_by=created_by,
        assigned_auditor=assigned_auditor,
        status=Audit.Status.DRAFT,
    )

    return audit


def update_audit(
    audit,
    title,
    description="",
    assigned_auditor=None
):

    if audit.status == Audit.Status.APPROVED:

        raise ValidationError(
            "Approved audit cannot be updated."
        )

    assigned_auditor = validate_audit_assignee(
        assigned_auditor
    )

    audit.title = title
    audit.description = description
    audit.assigned_auditor = assigned_auditor

    audit.save(
        update_fields=[
            "title",
            "description",
            "assigned_auditor",
            "updated_at",
        ]
    )

    return audit


def start_audit(audit):

    if audit.status != Audit.Status.DRAFT:

        raise ValidationError(
            "Only draft audits can be started."
        )

    audit.status = Audit.Status.IN_PROGRESS

    audit.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return audit


def submit_for_review(audit):

    if audit.status != Audit.Status.IN_PROGRESS:

        raise ValidationError(
            "Only in-progress audits can be submitted for review."
        )

    audit.status = Audit.Status.UNDER_REVIEW

    audit.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return audit


def review_audit(
    audit,
    reviewer
):

    if audit.status != Audit.Status.UNDER_REVIEW:

        raise ValidationError(
            "Only audits under review can be reviewed."
        )

    audit.reviewed_by = reviewer

    audit.save(
        update_fields=[
            "reviewed_by",
            "updated_at",
        ]
    )

    return audit


def approve_audit(
    audit,
    approver
):

    if audit.status != Audit.Status.UNDER_REVIEW:

        raise ValidationError(
            "Only audits under review can be approved."
        )

    audit.approved_by = approver
    audit.status = Audit.Status.APPROVED

    audit.save(
        update_fields=[
            "approved_by",
            "status",
            "updated_at",
        ]
    )

    return audit


def reject_audit(
    audit,
    reviewer
):

    if audit.status != Audit.Status.UNDER_REVIEW:

        raise ValidationError(
            "Only audits under review can be rejected."
        )

    audit.reviewed_by = reviewer
    audit.status = Audit.Status.REJECTED

    audit.save(
        update_fields=[
            "reviewed_by",
            "status",
            "updated_at",
        ]
    )

    return audit


def get_all_audits():

    return Audit.objects.select_related(
        "created_by",
        "assigned_auditor",
        "reviewed_by",
        "approved_by",
    ).order_by(
        "-created_at"
    )

