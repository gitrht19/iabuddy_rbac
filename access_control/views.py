from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Role
from .permissions import HasPermission
from .serializers import AssignRoleSerializer,RemoveRoleSerializer
from .services import assign_role_to_user,remove_role_from_user
from django.core.exceptions import ValidationError

User = get_user_model()


class AssignRoleView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "role.assign"

    def post(self, request):

        serializer = AssignRoleSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = get_object_or_404(
            User,
            account_id=serializer.validated_data["user_id"]
        )

        role = get_object_or_404(
            Role,
            id=serializer.validated_data["role_id"],
            is_active=True
        )

        user_role = assign_role_to_user(
            user=user,
            role=role,
            assigned_by=request.user
        )

        return Response(
            {
                "message": "Role assigned successfully.",
                "data": {
                    "user": user.email,
                    "role": role.name,
                    "assigned_by": request.user.email,
                    "assigned_at": user_role.assigned_at,
                }
            },
            status=status.HTTP_201_CREATED
        )

class RemoveRoleView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "role.remove"

    def delete(self, request):

        serializer = RemoveRoleSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = get_object_or_404(
            User,
            account_id=serializer.validated_data["user_id"]
        )

        role = get_object_or_404(
            Role,
            id=serializer.validated_data["role_id"],
            is_active=True
        )

        try:

            remove_role_from_user(
                user=user,
                role=role
            )

        except ValidationError as exc:

            return Response(
                {
                    "message": str(exc.message)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "Role removed successfully.",
                "data": {
                    "user": user.email,
                    "role": role.name,
                    "removed_by": request.user.email,
                }
            },
            status=status.HTTP_200_OK
        )
