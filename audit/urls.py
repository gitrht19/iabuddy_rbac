from django.urls import path

from .views import (
    ApproveAuditView,
    AuditDetailView,
    AuditListCreateView,
    AuditorUsersView,
    RejectAuditView,
    ReviewAuditView,
    StartAuditView,
    SubmitAuditForReviewView,
)


urlpatterns = [

    path(
        "audits/",
        AuditListCreateView.as_view(),
        name="audit-list-create",
    ),

    path(
        "audits/<int:audit_id>/",
        AuditDetailView.as_view(),
        name="audit-detail",
    ),

    path(
        "audits/<int:audit_id>/start/",
        StartAuditView.as_view(),
        name="audit-start",
    ),

    path(
        "audits/<int:audit_id>/submit-review/",
        SubmitAuditForReviewView.as_view(),
        name="audit-submit-review",
    ),

    path(
        "audits/<int:audit_id>/review/",
        ReviewAuditView.as_view(),
        name="audit-review",
    ),

    path(
        "audits/<int:audit_id>/reject/",
        RejectAuditView.as_view(),
        name="audit-reject",
    ),

    path(
        "audits/<int:audit_id>/approve/",
        ApproveAuditView.as_view(),
        name="audit-approve",
    ),
    
    path(
    "auditors/",
    AuditorUsersView.as_view(),
    name="auditor-users",
    ),
]