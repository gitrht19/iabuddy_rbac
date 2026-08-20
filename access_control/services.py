from rest_framework.exceptions import ValidationError
from .models import Permission, Role, RolePermission, UserRole

def assign_role_to_user(user, role, assigned_by=None):

    if not role.is_active:
        raise ValidationError(
            "Cannot assign an inactive role."
        )

    user_role, created = UserRole.objects.get_or_create(
        user=user,
        role=role,
        defaults={
            "assigned_by": assigned_by
        }
    )

    if not created:
        raise ValidationError(
            "This role is already assigned to the user."
        )

    return user_role


def remove_role_from_user(user, role):

    try:
        user_role = UserRole.objects.get(
            user=user,
            role=role
        )
    except UserRole.DoesNotExist:
        raise ValidationError(
            "This role is not assigned to the user."
        )

    user_role.delete()

    return True

def get_user_roles(user):

    return Role.objects.filter(
        user_roles__user=user,
        is_active=True
    ).distinct()

def get_all_roles():

    return Role.objects.filter(
        is_active=True
    ).order_by("id")


def create_role(name, description=""):

    role = Role.objects.create(
        name=name,
        description=description
    )

    return role

def update_role(role, name, description):

    role.name = name
    role.description = description

    role.save(
        update_fields=[
            "name",
            "description",
            "updated_at",
        ]
    )

    return role

def create_permission(name, code, description=""):

    permission = Permission.objects.create(
        name=name,
        code=code,
        description=description
    )

    return permission


def assign_permission_to_role(
    role,
    permission,
    assigned_by=None
):

    if not role.is_active:
        raise ValidationError(
            "Cannot assign permission to an inactive role."
        )

    if not permission.is_active:
        raise ValidationError(
            "Cannot assign an inactive permission."
        )

    role_permission, created = (
        RolePermission.objects.get_or_create(
            role=role,
            permission=permission,
            defaults={
                "assigned_by": assigned_by
            }
        )
    )

    if not created:
        raise ValidationError(
            "This permission is already assigned to the role."
        )

    return role_permission

def remove_permission_from_role(role, permission):

    try:
        role_permission = RolePermission.objects.get(
            role=role,
            permission=permission
        )
    except RolePermission.DoesNotExist:
        raise ValidationError(
            "This permission is not assigned to the role."
        )

    role_permission.delete()

    return True

def get_role_permissions(role):

    return Permission.objects.filter(
        role_permissions__role=role,
        is_active=True
    ).distinct().order_by("id")

def get_all_permissions():

    return Permission.objects.filter(
        is_active=True
    ).order_by("id")
