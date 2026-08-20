from django.contrib import admin
from .models import (Role,Permission,UserRole,RolePermission,)


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "is_active",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "is_active",
    )


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "code",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "code",
    )

    list_filter = (
        "is_active",
    )


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "role",
        "assigned_at",
        "assigned_by",
    )

    search_fields = (
        "user__email",
        "role__name",
    )

    list_filter = (
        "role",
    )


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):

    list_display = (
        "role",
        "permission",
        "assigned_at",
        "assigned_by",
    )

    search_fields = (
        "role__name",
        "permission__code",
    )

    list_filter = (
        "role",
    )