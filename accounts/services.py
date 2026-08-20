from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

from .models import OTPVerification
from .utils import generate_otp, hash_otp


def create_otp(user):

    # Delete all previous OTP records for this user
    OTPVerification.objects.filter(
        user=user
    ).delete()

    # Generate new OTP
    otp = generate_otp()

    # Hash OTP before storing it in database
    otp_hash = hash_otp(otp)

    # OTP will expire after 5 minutes
    expires_at = timezone.now() + timedelta(minutes=5)

    # Save OTP record
    OTPVerification.objects.create(
        user=user,
        otp_hash=otp_hash,
        expires_at=expires_at
    )

    # Render HTML email template
    html_message = render_to_string(
        "accounts/emails/otp_verification.html",
        {
            "user": user,
            "otp": otp,
        }
    )

    # Create email
    email = EmailMultiAlternatives(
        subject="IABuddy - Email Verification OTP",
        body=f"Your OTP is {otp}. It is valid for 5 minutes.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )

    # Attach HTML email
    email.attach_alternative(
        html_message,
        "text/html"
    )

    # Send email
    email.send(fail_silently=False)

    return otp


def verify_user_otp(user, otp):

    # Get the latest active OTP
    otp_record = (
        OTPVerification.objects
        .filter(
            user=user
        )
        .order_by("-created_at")
        .first()
    )

    # No OTP found
    if not otp_record:
        raise ValidationError(
            "No OTP found. Please request a new OTP."
        )

    # Check OTP expiry
    if timezone.now() > otp_record.expires_at:

        otp_record.delete()

        raise ValidationError(
            "OTP has expired. Please request a new OTP."
        )

    # Check maximum attempts
    if otp_record.attempts >= 5:

        otp_record.delete()

        raise ValidationError(
            "Maximum OTP attempts exceeded. Please request a new OTP."
        )

    # Increase verification attempt
    otp_record.attempts += 1

    # Check OTP against stored hash
    if not check_password(
        otp,
        otp_record.otp_hash
    ):

        otp_record.save(
            update_fields=["attempts"]
        )

        raise ValidationError(
            "Invalid OTP."
        )

    # OTP is correct
    user.is_verified = True

    user.save(
        update_fields=["is_verified"]
    )

    otp_record.delete()

    return True