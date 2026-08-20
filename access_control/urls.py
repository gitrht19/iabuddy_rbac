from django.urls import path

from .views import AssignRoleView


urlpatterns = [
    path("users/roles/",AssignRoleView.as_view(),name="assign-role"),
]