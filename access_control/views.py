from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Permission, Role
from .permissions import HasPermission
from .serializers import AssignPermissionSerializer, AssignRoleSerializer, CreatePermissionSerializer, CreateRoleSerializer, ListUserRolesSerializer, PermissionListSerializer, RemovePermissionSerializer,RemoveRoleSerializer, RoleListSerializer, RolePermissionListSerializer, UpdateRoleSerializer, UserRoleResponseSerializer
from .services import assign_permission_to_role, assign_role_to_user, create_permission, create_role, get_all_permissions, get_all_roles, get_role_permissions, get_user_roles, remove_permission_from_role,remove_role_from_user, update_role
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


class ListUserRolesView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "role.view"

    def get(self, request):

        serializer = ListUserRolesSerializer(
            data=request.query_params
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = get_object_or_404(
            User,
            account_id=serializer.validated_data["user_id"]
        )

        roles = get_user_roles(user)

        role_serializer = UserRoleResponseSerializer(
            roles,
            many=True
        )

        return Response(
            {
                "message": "User roles fetched successfully.",
                "data": {
                    "user": user.email,
                    "roles": role_serializer.data
                }
            },
            status=status.HTTP_200_OK
        )

class ListRolesView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "role.view"

    def get(self, request):

        roles = get_all_roles()

        serializer = RoleListSerializer(
            roles,
            many=True
        )

        return Response(
            {
                "message": "Roles fetched successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

class CreateRoleView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "role.create"

    def post(self, request):

        serializer = CreateRoleSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        role = create_role(
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get(
                "description",
                ""
            )
        )

        return Response(
            {
                "message": "Role created successfully.",
                "data": {
                    "id": role.id,
                    "name": role.name,
                    "description": role.description,
                    "is_active": role.is_active,
                }
            },
            status=status.HTTP_201_CREATED
        )

class UpdateRoleView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "role.update"

    def put(self, request, role_id):

        role = get_object_or_404(
            Role,
            id=role_id,
            is_active=True
        )

        serializer = UpdateRoleSerializer(
            instance=role,
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        role = update_role(
            role=role,
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get(
                "description",
                ""
            )
        )

        return Response(
            {
                "message": "Role updated successfully.",
                "data": {
                    "id": role.id,
                    "name": role.name,
                    "description": role.description,
                    "is_active": role.is_active,
                }
            },
            status=status.HTTP_200_OK
        )

class CreatePermissionView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "permission.create"

    def post(self, request):

        serializer = CreatePermissionSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        permission = create_permission(
            name=serializer.validated_data["name"],
            code=serializer.validated_data["code"],
            description=serializer.validated_data.get(
                "description",
                ""
            )
        )

        return Response(
            {
                "message": "Permission created successfully.",
                "data": {
                    "id": permission.id,
                    "name": permission.name,
                    "code": permission.code,
                    "description": permission.description,
                    "is_active": permission.is_active,
                }
            },
            status=status.HTTP_201_CREATED
        )

class AssignPermissionToRoleView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "permission.assign"

    def post(self, request, role_id):

        serializer = AssignPermissionSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        role = get_object_or_404(
            Role,
            id=role_id,
            is_active=True
        )

        permission = get_object_or_404(
            Permission,
            id=serializer.validated_data[
                "permission_id"
            ],
            is_active=True
        )

        try:

            role_permission = (
                assign_permission_to_role(
                    role=role,
                    permission=permission,
                    assigned_by=request.user
                )
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
                "message": "Permission assigned successfully.",
                "data": {
                    "role": role.name,
                    "permission": permission.name,
                    "permission_code": permission.code,
                    "assigned_by": request.user.email,
                    "assigned_at": (
                        role_permission.assigned_at
                    ),
                }
            },
            status=status.HTTP_201_CREATED
        )

class RemovePermissionFromRoleView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "permission.assign"

    def delete(self, request, role_id):

        serializer = RemovePermissionSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        role = get_object_or_404(
            Role,
            id=role_id,
            is_active=True
        )

        permission = get_object_or_404(
            Permission,
            id=serializer.validated_data[
                "permission_id"
            ],
            is_active=True
        )

        try:

            remove_permission_from_role(
                role=role,
                permission=permission
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
                "message": "Permission removed successfully.",
                "data": {
                    "role": role.name,
                    "permission": permission.name,
                    "permission_code": permission.code,
                    "removed_by": request.user.email,
                }
            },
            status=status.HTTP_200_OK
        )

class ListRolePermissionsView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "permission.view"

    def get(self, request, role_id):

        role = get_object_or_404(
            Role,
            id=role_id,
            is_active=True
        )

        permissions = get_role_permissions(role)

        serializer = RolePermissionListSerializer(
            permissions,
            many=True
        )

        return Response(
            {
                "message": "Role permissions fetched successfully.",
                "data": {
                    "role": {
                        "id": role.id,
                        "name": role.name,
                    },
                    "permissions": serializer.data
                }
            },
            status=status.HTTP_200_OK
        )


class UserListView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "user.view"

    def get(self, request):

        users = User.objects.filter(
            is_active=True
        ).values(
            "account_id",
            "email"
        )

        return Response(
            {
                "message": "Users fetched successfully.",
                "data": list(users)
            }
        )

class ListPermissionsView(APIView):

    permission_classes = [
        IsAuthenticated,
        HasPermission,
    ]

    required_permission = "permission.view"

    def get(self, request):

        permissions = get_all_permissions()

        serializer = PermissionListSerializer(
            permissions,
            many=True
        )

        return Response(
            {
                "message": "Permissions fetched successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
