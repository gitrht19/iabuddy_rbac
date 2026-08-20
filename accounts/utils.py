import secrets

from django.contrib.auth.hashers import make_password, check_password


def generate_otp():
    return str(secrets.randbelow(900000) + 100000)


def hash_otp(otp):
    return make_password(otp)


def verify_otp(otp, otp_hash):
    return check_password(otp, otp_hash)