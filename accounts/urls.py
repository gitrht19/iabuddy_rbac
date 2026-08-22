from django.urls import path
from .views import ProfileView, RegisterView,VerifyOTPView,ResendOTPView,LoginView,LogoutView,ForgotPasswordView,VerifyResetOTPView,ResetPasswordView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path("register/",RegisterView.as_view(),name="register"),
    path("verify-otp/",VerifyOTPView.as_view(),name="verify-otp"),
    path("resend-otp/",ResendOTPView.as_view(),name="resend-otp"),  
    path("login/", LoginView.as_view(),name="login"),
    path("logout/",LogoutView.as_view(),name="logout"),
    path("forgot-password/",ForgotPasswordView.as_view(),name="forgot-password"),
    path("verify-reset-otp/",VerifyResetOTPView.as_view(),name="verify-reset-otp"),
    path("reset-password/",ResetPasswordView.as_view(),name="reset-password"),
    path("profile/",ProfileView.as_view(),name="profile"),
    path("token/refresh/",TokenRefreshView.as_view(),name="token_refresh"),
]