from django.core.management.base import BaseCommand
from access_control.models import Role, Permission, RolePermission


class Command(BaseCommand):

    help = "Seed default RBAC roles and permissions"

    def handle(self, *args, **options):

        self.stdout.write(
            self.style.WARNING(
                "Starting RBAC data seeding..."
            )
        )

        # ---------------------------------
        # Create Permissions
        # ---------------------------------

        permissions = [
            ("View Users", "user.view"),
            ("Create Users", "user.create"),
            ("Update Users", "user.update"),
            ("Delete Users", "user.delete"),

            ("View Roles", "role.view"),
            ("Create Roles", "role.create"),
            ("Update Roles", "role.update"),
            ("Assign Roles", "role.assign"),

            ("View Permissions", "permission.view"),
            ("Assign Permissions", "permission.assign"),

            ("View Audits", "audit.view"),
            ("Create Audits", "audit.create"),
            ("Update Audits", "audit.update"),
            ("Review Audits", "audit.review"),
            ("Approve Audits", "audit.approve"),
            ("Export Audits", "audit.export"),
        ]

        permission_objects = {}

        for name, code in permissions:

            permission, created = Permission.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "description": f"Permission to {name.lower()}."
                }
            )

            permission_objects[code] = permission

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created permission: {code}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"Permission already exists: {code}"
                    )
                )

        # ---------------------------------
        # Create Roles
        # ---------------------------------

        roles = [
            (
                "Manager",
                "Manages users, roles, permissions and audit activities."
            ),
            (
                "Reviewer",
                "Reviews audit testing and evidence."
            ),
            (
                "Approver",
                "Approves completed audit work."
            ),
            (
                "Auditor",
                "Performs audit testing and manages audit evidence."
            ),
        ]

        role_objects = {}

        for name, description in roles:

            role, created = Role.objects.get_or_create(
                name=name,
                defaults={
                    "description": description
                }
            )

            role_objects[name] = role

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created role: {name}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"Role already exists: {name}"
                    )
                )

        # ---------------------------------
        # Role → Permission Mapping
        # ---------------------------------

        role_permissions = {

            "Manager": [
                "user.view",
                "user.create",
                "user.update",
                "user.delete",

                "role.view",
                "role.create",
                "role.update",
                "role.assign",

                "permission.view",
                "permission.assign",

                "audit.view",
                "audit.create",
                "audit.update",
                "audit.review",
                "audit.approve",
                "audit.export",
            ],

            "Reviewer": [
                "audit.view",
                "audit.review",
            ],

            "Approver": [
                "audit.view",
                "audit.approve",
            ],

            "Auditor": [
                "audit.view",
                "audit.create",
                "audit.update",
            ],
        }

        # ---------------------------------
        # Assign Permissions to Roles
        # ---------------------------------

        for role_name, permission_codes in role_permissions.items():

            role = role_objects[role_name]

            for permission_code in permission_codes:

                permission = permission_objects[
                    permission_code
                ]

                role_permission, created = (
                    RolePermission.objects.get_or_create(
                        role=role,
                        permission=permission
                    )
                )

                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Assigned {permission_code} "
                            f"→ {role_name}"
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS(
                "RBAC data seeding completed successfully."
            )
        )