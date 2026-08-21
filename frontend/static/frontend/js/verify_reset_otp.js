document.addEventListener(
    "DOMContentLoaded",
    function () {

        const email =
            sessionStorage.getItem(
                "reset_verification_email"
            );


        const verifyForm =
            document.getElementById(
                "verify-reset-otp-form"
            );

        const verifyButton =
            document.getElementById(
                "verify-reset-button"
            );

        const messageElement =
            document.getElementById(
                "verify-reset-message"
            );


        if (!email) {

            window.location.replace(
                "/forgot-password/"
            );

            return;

        }


        verifyForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const otp =
                    document.getElementById(
                        "otp"
                    ).value.trim();


                hideMessage();

                verifyButton.disabled = true;

                verifyButton.textContent =
                    "Verifying...";


                try {

                    const response =
                        await fetch(
                            "/accounts/verify-reset-otp/",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
                                    otp: otp
                                })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        showMessage(
                            getErrorMessage(result),
                            "danger"
                        );

                        return;
                    }


                    sessionStorage.setItem(
                        "password_reset_token",
                        result.reset_token
                    );


                    sessionStorage.removeItem(
                        "reset_verification_email"
                    );


                    showMessage(
                        result.message,
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "/reset-password/";

                        },
                        1000
                    );


                } catch (error) {

                    console.error(
                        "Reset OTP verification error:",
                        error
                    );


                    showMessage(
                        "Unable to verify OTP. Please try again.",
                        "danger"
                    );


                } finally {

                    verifyButton.disabled = false;

                    verifyButton.textContent =
                        "Verify OTP";

                }

            }
        );


        function showMessage(
            message,
            type
        ) {

            messageElement.textContent =
                message;

            messageElement.className =
                `alert alert-${type}`;

        }


        function hideMessage() {

            messageElement.textContent =
                "";

            messageElement.className =
                "alert d-none";

        }


        function getErrorMessage(
            result
        ) {

            if (result.message) {

                return result.message;

            }


            if (
                typeof result === "string"
            ) {

                return result;

            }


            const firstField =
                Object.values(result)[0];


            if (Array.isArray(firstField)) {

                return firstField[0];

            }


            if (typeof firstField === "string") {

                return firstField;

            }


            return "OTP verification failed.";

        }

    }
);