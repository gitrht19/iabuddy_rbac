from rest_framework.permissions import BasePermission

from .models import RolePermission


class HasPermission(BasePermission):

    required_permission = None

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True

        permission_code = getattr(
            view,
            "required_permission",
            self.required_permission
        )

        if not permission_code:
            return False

        return RolePermission.objects.filter(
            role__user_roles__user=request.user,
            permission__code=permission_code,
            permission__is_active=True,
            role__is_active=True,
        ).exists()