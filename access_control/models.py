from django.conf import settings
from django.db import models


class Role(models.Model):
    name = models.CharField(max_length=100,unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Permission(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=100,unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserRole(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="user_roles")
    role = models.ForeignKey(Role,on_delete=models.CASCADE,related_name="user_roles")
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="assigned_roles")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "role"],
                name="unique_user_role"
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.role.name}"


class RolePermission(models.Model):
    role = models.ForeignKey(Role,on_delete=models.CASCADE,related_name="role_permissions")
    permission = models.ForeignKey(Permission,on_delete=models.CASCADE,related_name="role_permissions")
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="assigned_permissions")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["role", "permission"],
                name="unique_role_permission"
            )
        ]

    def __str__(self):
        return f"{self.role.name} - {self.permission.code}"

class Module(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    code = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.TextField(
        blank=True
    )

    url = models.CharField(
        max_length=255,
        blank=True
    )

    icon = models.CharField(
        max_length=100,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return self.name

class ModulePermission(models.Model):

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="module_permissions"
    )

    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name="module_permissions"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "module",
                    "permission"
                ],
                name="unique_module_permission"
            )
        ]

    def __str__(self):

        return (
            f"{self.module.name} - "
            f"{self.permission.code}"
        )
    