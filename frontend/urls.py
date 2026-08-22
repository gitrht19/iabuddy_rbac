from django.urls import path

from .views import AuditPageView, ForgotPasswordPageView, PermissionsPageView, ProfilePageView, RegisterPageView, ResetPasswordPageView, RolesPageView, UsersPageView,VerifyOTPPageView, VerifyResetOTPPageView, dashboard,login_page


urlpatterns = [

    path(
        "register/",
        RegisterPageView,
        name="register"
    ),

    path(
        "verify-otp/",
        VerifyOTPPageView,
        name="verify-otp"
    ),

    path(
        "login/",
        login_page,
        name="login"
    ),

    path(
        "dashboard/",
        dashboard,
        name="dashboard"
    ),

    path(
        "forgot-password/",
        ForgotPasswordPageView,
        name="forgot-password"
    ),

    path(
        "verify-reset-otp/",
        VerifyResetOTPPageView,
        name="verify-reset-otp"
    ),

    path(
        "reset-password/",
        ResetPasswordPageView,
        name="reset-password"
    ),

    path(
        "profile/",
        ProfilePageView,
        name="profile"
    ),
    path(
        "users/",
        UsersPageView,
        name="users"
    ),

    path(
        "roles/",
        RolesPageView,
        name="roles"
    ),
    
    path(
        "permissions/",
        PermissionsPageView,
        name="permissions"
    ),

    path(
        "audit/",
        AuditPageView,
        name="audit"
    )
]