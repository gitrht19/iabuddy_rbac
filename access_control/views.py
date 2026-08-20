from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Role
from .permissions import HasPermission
from .serializers import AssignRoleSerializer
from .services import assign_role_to_user


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