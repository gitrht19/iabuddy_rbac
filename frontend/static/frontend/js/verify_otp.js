document.addEventListener(
    "DOMContentLoaded",
    function () {

        const email =
            sessionStorage.getItem(
                "verification_email"
            );

        const verifyForm =
            document.getElementById(
                "verify-otp-form"
            );

        const otpInput =
            document.getElementById(
                "otp"
            );

        const verifyButton =
            document.getElementById(
                "verify-button"
            );

        const resendButton =
            document.getElementById(
                "resend-button"
            );

        const messageElement =
            document.getElementById(
                "verify-message"
            );


        if (!email) {

            window.location.href =
                "/register/";

            return;
        }


        verifyForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const otp =
                    otpInput.value.trim();


                hideMessage();

                verifyButton.disabled = true;

                verifyButton.textContent =
                    "Verifying...";


                try {

                    const response =
                        await fetch(
                            "/accounts/verify-otp/",
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


                    showMessage(
                        result.message,
                        "success"
                    );


                    sessionStorage.removeItem(
                        "verification_email"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "/login/";

                        },
                        1000
                    );


                } catch (error) {

                    console.error(
                        "OTP verification error:",
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


        resendButton.addEventListener(
            "click",
            async function () {

                hideMessage();

                resendButton.disabled = true;

                resendButton.textContent =
                    "Sending...";


                try {

                    const response =
                        await fetch(
                            "/accounts/resend-otp/",
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


                } catch (error) {

                    console.error(
                        "Resend OTP error:",
                        error
                    );


                    showMessage(
                        "Unable to resend OTP. Please try again.",
                        "danger"
                    );


                } finally {

                    resendButton.disabled = false;

                    resendButton.textContent =
                        "Resend OTP";

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


            return "Request failed.";

        }

    }
);