from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from access_control.models import RolePermission
from access_control.permissions import HasPermission
from access_control.services import get_users_by_permission

from .models import Audit
from .serializers import (
    AuditDetailSerializer,
    AuditListSerializer,
    CreateAuditSerializer,
    UpdateAuditSerializer,
)
from .services import (
    approve_audit,
    create_audit,
    get_all_audits,
    reject_audit,
    review_audit,
    start_audit,
    submit_for_review,
    update_audit,
)

class AuditListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    def get_permissions(self):

        self.required_permission = (
            "audit.create"
            if self.request.method == "POST"
            else "audit.view"
        )

        return super().get_permissions()

    def get(self, request):

        audits = get_all_audits()

        serializer = AuditListSerializer(
            audits,
            many=True
        )

        return Response(
            {
                "message": "Audits fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )

    def post(self, request):

        serializer = CreateAuditSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        assigned_auditor = (
            serializer.validated_data.get(
                "assigned_auditor"
            )
        )

        audit = create_audit(
            title=serializer.validated_data["title"],
            description=serializer.validated_data.get(
                "description",
                ""
            ),
            created_by=request.user,
            assigned_auditor=assigned_auditor,
        )

        response_serializer = AuditDetailSerializer(
            audit
        )

        return Response(
            {
                "message": "Audit created successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED
        )


class AuditDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    def get_permissions(self):

        self.required_permission = (
            "audit.update"
            if self.request.method == "PUT"
            else "audit.view"
        )

        return super().get_permissions()

    def get(self, request, audit_id):

        audit = get_object_or_404(
            Audit,
            id=audit_id
        )

        serializer = AuditDetailSerializer(
            audit
        )

        return Response(
            {
                "message": "Audit fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )

    def put(self, request, audit_id):

        audit = get_object_or_404(
            Audit,
            id=audit_id
        )

        serializer = UpdateAuditSerializer(
            instance=audit,
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:

            audit = update_audit(
                audit=audit,
                title=serializer.validated_data[
                    "title"
                ],
                description=serializer.validated_data.get(
                    "description",
                    ""
                ),
                assigned_auditor=serializer.validated_data.get(
                    "assigned_auditor"
                ),
            )

        except ValidationError as exc:

            return Response(
                {
                    "message": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        response_serializer = AuditDetailSerializer(
            audit
        )

        return Response(
            {
                "message": "Audit updated successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_200_OK
        )


class StartAuditView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "audit.update"

    def post(self, request, audit_id):

        audit = get_object_or_404(
            Audit,
            id=audit_id
        )

        try:

            audit = start_audit(
                audit
            )

        except ValidationError as exc:

            return Response(
                {
                    "message": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AuditDetailSerializer(
            audit
        )

        return Response(
            {
                "message": "Audit started successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )


class SubmitAuditForReviewView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "audit.update"

    def post(self, request, audit_id):

        audit = get_object_or_404(
            Audit,
            id=audit_id
        )

        try:

            audit = submit_for_review(
                audit
            )

        except ValidationError as exc:

            return Response(
                {
                    "message": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AuditDetailSerializer(
            audit
        )

        return Response(
            {
                "message": "Audit submitted for review.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )


class ReviewAuditView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "audit.review"

    def post(self, request, audit_id):

        audit = get_object_or_404(
            Audit,
            id=audit_id
        )

        try:

            audit = review_audit(
                audit=audit,
                reviewer=request.user
            )

        except ValidationError as exc:

            return Response(
                {
                    "message": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AuditDetailSerializer(
            audit
        )

        return Response(
            {
                "message": "Audit reviewed successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )


class RejectAuditView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "audit.reject"

    def post(self, request, audit_id):

        audit = get_object_or_404(
            Audit,
            id=audit_id
        )

        try:

            audit = reject_audit(
                audit=audit,
                reviewer=request.user
            )

        except ValidationError as exc:

            return Response(
                {
                    "message": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AuditDetailSerializer(
            audit
        )

        return Response(
            {
                "message": "Audit rejected successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )


class ApproveAuditView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "audit.approve"

    def post(self, request, audit_id):

        audit = get_object_or_404(
            Audit,
            id=audit_id
        )

        try:

            audit = approve_audit(
                audit=audit,
                approver=request.user
            )

        except ValidationError as exc:

            return Response(
                {
                    "message": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AuditDetailSerializer(
            audit
        )

        return Response(
            {
                "message": "Audit approved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK
        )


class AuditorUsersView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "audit.create"

    def get(self, request):

        users = get_users_by_permission(
            "audit.assign"
        ).values(
            "account_id",
            "email",
            "full_name",
        )

        return Response(
            {
                "message": (
                    "Eligible audit assignees fetched successfully."
                ),
                "data": list(users),
            },
            status=status.HTTP_200_OK,
        )
