from django.urls import path

from .views import AssignRoleView, RemoveRoleView


urlpatterns = [
    path("users/roles/assign/",AssignRoleView.as_view(),name="assign-role"),
    path("users/roles/remove/",RemoveRoleView.as_view(),name="remove-role",),
]