from django.contrib import admin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "full_name",
        "is_active",
        "is_staff",
        "is_verified",
        "created_at",
    )
    list_filter = ("is_active", "is_staff", "is_verified")
    search_fields = ("email", "full_name")
    ordering = ("-created_at",)
    readonly_fields = ("account_id", "created_at", "updated_at")
