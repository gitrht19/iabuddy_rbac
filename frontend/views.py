from django.shortcuts import render

def RegisterPageView(request):
    return render(
        request,
        "frontend/register.html"
    )

def VerifyOTPPageView(request):
    return render(
        request,
        "frontend/verify_otp.html"
    )

def login_page(request):

    return render(
        request,
        "frontend/login.html"
    )

def dashboard(request):

    return render(
        request,
        "frontend/dashboard.html"
    )

def ForgotPasswordPageView(request):
    return render(
        request,
        "frontend/forgot_password.html"
    )

def VerifyResetOTPPageView(request):
    return render(
        request,
        "frontend/verify_reset_otp.html"
    )

def ResetPasswordPageView(request):
    return render(
        request,
        "frontend/reset_password.html"
    )

def ProfilePageView(request):
    return render(
        request,
        "frontend/profile.html"
    )