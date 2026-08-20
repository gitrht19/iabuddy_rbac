from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True,min_length=8)

    class Meta:
        model = User
        fields = ["email","full_name","password",]
        extra_kwargs = {
            "email": {
                "validators": []
            }
        }

    def validate_email(self, value):
        return value.lower().strip()

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password,**validated_data)
        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6,max_length=6)

    def validate_email(self, value):
        return value.lower().strip()

class ResendOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True
    )

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, attrs):

        email = attrs["email"]
        password = attrs["password"]

        user = authenticate(
            email=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_verified:
            raise serializers.ValidationError(
                "Please verify your email before login."
            )

        attrs["user"] = user

        return attrs


class LogoutSerializer(serializers.Serializer):

    refresh = serializers.CharField()

    def validate_refresh(self, value):

        try:
            token = RefreshToken(value)

            # Blacklist refresh token
            token.blacklist()

        except TokenError:
            raise serializers.ValidationError(
                "Invalid or expired refresh token."
            )

        return value

class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()

class VerifyResetOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()
    otp = serializers.CharField(
        min_length=6,
        max_length=6
    )

    def validate_email(self, value):
        return value.lower().strip()

class ResetPasswordSerializer(serializers.Serializer):

    reset_token = serializers.CharField()

    new_password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    def validate(self, attrs):

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        return attrs
