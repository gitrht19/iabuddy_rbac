document.addEventListener(
    "DOMContentLoaded",
    function () {

        const forgotPasswordForm =
            document.getElementById(
                "forgot-password-form"
            );

        const forgotPasswordButton =
            document.getElementById(
                "forgot-password-button"
            );

        const messageElement =
            document.getElementById(
                "forgot-password-message"
            );


        forgotPasswordForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "email"
                    ).value.trim();


                hideMessage();

                forgotPasswordButton.disabled = true;

                forgotPasswordButton.textContent =
                    "Sending...";


                try {

                    const response =
                        await fetch(
                            "/accounts/forgot-password/",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email
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


                    showMessage(
                        result.message,
                        "success"
                    );


                    sessionStorage.setItem(
                        "reset_verification_email",
                        email
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "/verify-reset-otp/";

                        },
                        1000
                    );


                } catch (error) {

                    console.error(
                        "Forgot password error:",
                        error
                    );


                    showMessage(
                        "Unable to process your request. Please try again.",
                        "danger"
                    );


                } finally {

                    forgotPasswordButton.disabled = false;

                    forgotPasswordButton.textContent =
                        "Send OTP";

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


            return "Unable to process the request.";

        }

    }
);