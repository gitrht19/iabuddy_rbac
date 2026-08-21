from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import OTPVerification
from .serializers import ProfileSerializer, RegisterSerializer,VerifyOTPSerializer,ResendOTPSerializer,LoginSerializer,LogoutSerializer,ForgotPasswordSerializer,VerifyResetOTPSerializer,ResetPasswordSerializer
from .services import create_otp,verify_user_otp
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from math import ceil
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
import secrets
from django.core.cache import cache

User = get_user_model()


class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        existing_user = User.objects.filter(
            email=email
        ).first()

        if existing_user:

            if existing_user.is_verified:
                return Response(
                    {
                        "message": "Email is already registered."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = existing_user

        else:
            user = serializer.save()

        create_otp(user)

        return Response(
            {
                "message": "OTP sent successfully. Please verify your email."
            },
            status=status.HTTP_201_CREATED
        )

class VerifyOTPView(APIView):

    def post(self, request):

        serializer = VerifyOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        user = User.objects.filter(
            email=email
        ).first()

        if not user:
            return Response(
                {
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_verified:
            return Response(
                {
                    "message": "User is already verified."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            verify_user_otp(
                user,
                otp
            )

        except ValidationError as error:
            return Response(
                {
                    "message": error.message
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message": "Email verified successfully."
            },
            status=status.HTTP_200_OK
        )

class ResendOTPView(APIView):

    def post(self, request):

        serializer = ResendOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]

        user = User.objects.filter(
            email=email
        ).first()

        if not user:
            return Response(
                {
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_verified:
            return Response(
                {
                    "message": "Email is already verified."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        last_otp = OTPVerification.objects.filter(
            user=user
        ).order_by("-created_at").first()

        if last_otp:

            time_difference = (
                timezone.now() - last_otp.created_at
            )

            if time_difference < timedelta(seconds=30):

                remaining_seconds = ceil(
                    30 - time_difference.total_seconds()
                )

                return Response(
                    {
                        "message": (
                            f"Please wait {remaining_seconds} "
                            "seconds before requesting a new OTP."
                        )
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

        create_otp(user)

        return Response(
            {
                "message": "A new OTP has been sent to your email."
            },
            status=status.HTTP_200_OK
        )


class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = LogoutSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        return Response(
            {
                "message": "Logout successful."
            },
            status=status.HTTP_200_OK
        )

class ForgotPasswordView(APIView):

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]

        user = User.objects.filter(
            email=email
        ).first()

        if not user:
            return Response(
                {
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not user.is_verified:
            return Response(
                {
                    "message": "Please verify your email first."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        create_otp(user)

        return Response(
            {
                "message": "OTP sent successfully. Please check your email."
            },
            status=status.HTTP_200_OK
        )

class VerifyResetOTPView(APIView):

    def post(self, request):

        serializer = VerifyResetOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        user = User.objects.filter(
            email=email
        ).first()

        if not user:
            return Response(
                {
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not user.is_verified:
            return Response(
                {
                    "message": "Please verify your email first."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            verify_user_otp(
                user,
                otp
            )

        except ValidationError as error:
            return Response(
                {
                    "message": error.message
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate temporary reset token
        reset_token = secrets.token_urlsafe(32)

        # Store token for 10 minutes
        cache.set(
            f"password_reset:{reset_token}",
            user.id,
            timeout=600
        )

        return Response(
            {
                "message": "OTP verified successfully.",
                "reset_token": reset_token
            },
            status=status.HTTP_200_OK
        )

class ResetPasswordView(APIView):

    def post(self, request):

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        reset_token = serializer.validated_data["reset_token"]
        new_password = serializer.validated_data["new_password"]

        # Get user ID from cache
        user_id = cache.get(
            f"password_reset:{reset_token}"
        )

        if not user_id:
            return Response(
                {
                    "message": "Invalid or expired reset token."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(
            id=user_id
        ).first()

        if not user:
            return Response(
                {
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Update password
        user.set_password(new_password)
        user.save(
            update_fields=["password"]
        )

        # Make reset token unusable
        cache.delete(
            f"password_reset:{reset_token}"
        )

        return Response(
            {
                "message": "Password reset successfully."
            },
            status=status.HTTP_200_OK
        )

class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = ProfileSerializer(
            request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


    def patch(self, request):

        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )