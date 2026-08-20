from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Permission, Role


User = get_user_model()


class AssignRoleSerializer(serializers.Serializer):

    user_id = serializers.UUIDField()

    role_id = serializers.IntegerField()

    def validate_user_id(self, value):

        if not User.objects.filter(
            account_id=value
        ).exists():
            raise serializers.ValidationError(
                "User not found."
            )

        return value

    def validate_role_id(self, value):

        try:
            role = Role.objects.get(
                id=value,
                is_active=True
            )
        except Role.DoesNotExist:
            raise serializers.ValidationError(
                "Active role not found."
            )

        return value

class RemoveRoleSerializer(serializers.Serializer):

    user_id = serializers.UUIDField()

    role_id = serializers.IntegerField()

    def validate_user_id(self, value):

        if not User.objects.filter(
            account_id=value
        ).exists():
            raise serializers.ValidationError(
                "User not found."
            )

        return value

    def validate_role_id(self, value):

        try:
            Role.objects.get(
                id=value,
                is_active=True
            )
        except Role.DoesNotExist:
            raise serializers.ValidationError(
                "Active role not found."
            )

        return value

class ListUserRolesSerializer(serializers.Serializer):

    user_id = serializers.UUIDField()

    def validate_user_id(self, value):

        if not User.objects.filter(
            account_id=value
        ).exists():
            raise serializers.ValidationError(
                "User not found."
            )

        return value

class UserRoleResponseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
        ]

class RoleListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
        ]


class CreateRoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = [
            "name",
            "description",
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Role name cannot be empty."
            )

        if Role.objects.filter(
            name__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "Role with this name already exists."
            )

        return value

class UpdateRoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Role
        fields = [
            "name",
            "description",
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Role name cannot be empty."
            )

        role_id = self.instance.id

        if Role.objects.filter(
            name__iexact=value
        ).exclude(
            id=role_id
        ).exists():
            raise serializers.ValidationError(
                "Role with this name already exists."
            )

        return value

class CreatePermissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permission
        fields = [
            "name",
            "code",
            "description",
        ]

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Permission name cannot be empty."
            )

        return value

    def validate_code(self, value):

        value = value.strip().lower()

        if not value:
            raise serializers.ValidationError(
                "Permission code cannot be empty."
            )

        if Permission.objects.filter(
            code=value
        ).exists():
            raise serializers.ValidationError(
                "Permission with this code already exists."
            )

        return value

class AssignPermissionSerializer(serializers.Serializer):

    permission_id = serializers.IntegerField()

    def validate_permission_id(self, value):

        if not Permission.objects.filter(
            id=value,
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                "Active permission not found."
            )

        return value

class RemovePermissionSerializer(serializers.Serializer):

    permission_id = serializers.IntegerField()

    def validate_permission_id(self, value):

        if not Permission.objects.filter(
            id=value,
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                "Active permission not found."
            )

        return value

class RolePermissionListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permission
        fields = [
            "id",
            "name",
            "code",
            "description",
        ]

class PermissionListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permission
        fields = [
            "id",
            "name",
            "code",
            "description",
        ]
        