from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Role


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
    