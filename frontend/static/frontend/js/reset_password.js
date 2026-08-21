document.addEventListener(
    "DOMContentLoaded",
    function () {

        const resetToken =
            sessionStorage.getItem(
                "password_reset_token"
            );


        const resetForm =
            document.getElementById(
                "reset-password-form"
            );

        const resetButton =
            document.getElementById(
                "reset-password-button"
            );

        const messageElement =
            document.getElementById(
                "reset-password-message"
            );


        if (!resetToken) {

            window.location.replace(
                "/forgot-password/"
            );

            return;

        }


        resetForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const newPassword =
                    document.getElementById(
                        "new-password"
                    ).value;

                const confirmPassword =
                    document.getElementById(
                        "confirm-password"
                    ).value;


                hideMessage();


                resetButton.disabled = true;

                resetButton.textContent =
                    "Resetting...";


                try {

                    const response =
                        await fetch(
                            "/accounts/reset-password/",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    reset_token:
                                        resetToken,

                                    new_password:
                                        newPassword,

                                    confirm_password:
                                        confirmPassword
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


                    sessionStorage.removeItem(
                        "password_reset_token"
                    );


                    showMessage(
                        result.message,
                        "success"
                    );


                    resetForm.reset();


                    setTimeout(
                        function () {

                            window.location.replace(
                                "/login/"
                            );

                        },
                        1000
                    );


                } catch (error) {

                    console.error(
                        "Reset password error:",
                        error
                    );


                    showMessage(
                        "Unable to reset password. Please try again.",
                        "danger"
                    );


                } finally {

                    resetButton.disabled = false;

                    resetButton.textContent =
                        "Reset Password";

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


            if (
                typeof firstField === "string"
            ) {

                return firstField;

            }


            return "Password reset failed.";

        }

    }
);