from django.core.exceptions import ValidationError
from .models import Role, UserRole

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