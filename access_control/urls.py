from django.urls import path

from .views import AssignPermissionToRoleView, AssignRoleView, CreatePermissionView, CreateRoleView, CurrentUserPermissionsView, ListPermissionsView, ListRolePermissionsView, ListRolesView, ListUserRolesView, RemovePermissionFromRoleView, RemoveRoleView, UpdateRoleView, UserListView


urlpatterns = [
    path("users/roles/assign/",AssignRoleView.as_view(),name="assign-role"),
    path("users/roles/remove/",RemoveRoleView.as_view(),name="remove-role"),
    path("users/roles/",ListUserRolesView.as_view(),name="list-user-roles"),

    path("roles/",ListRolesView.as_view(),name="list-roles"),
    path("create/roles/",CreateRoleView.as_view(),name="create-role"),
    path("update/roles/<int:role_id>/",UpdateRoleView.as_view(),name="update-role"),

    path("create/permissions/",CreatePermissionView.as_view(),name="create-permission"),
    path("list-permissions/",ListPermissionsView.as_view(),name="list-permissions",),
    path("assign/roles/permissions/<int:role_id>/",AssignPermissionToRoleView.as_view(),name="assign-permission-to-role"),
    path("remove/roles/permissions/<int:role_id>/",RemovePermissionFromRoleView.as_view(),name="remove-permission-from-role"),
    path("list/roles/permissions/<int:role_id>/",ListRolePermissionsView.as_view(),name="list-role-permissions"),

    path("me/permissions/",CurrentUserPermissionsView.as_view(),name="current-user-permissions"),
    path("users/",UserListView.as_view(),name="user-list"),
]