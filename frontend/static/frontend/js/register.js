document.addEventListener(
    "DOMContentLoaded",
    function () {

        const registerForm =
            document.getElementById("register-form");

        const registerButton =
            document.getElementById("register-button");

        const messageElement =
            document.getElementById("register-message");


        registerForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const fullName =
                    document.getElementById(
                        "full-name"
                    ).value.trim();

                const email =
                    document.getElementById(
                        "email"
                    ).value.trim();

                const password =
                    document.getElementById(
                        "password"
                    ).value;


                hideMessage();

                registerButton.disabled = true;

                registerButton.textContent =
                    "Registering...";


                try {

                    const response =
                        await fetch(
                            "/accounts/register/",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
                                    full_name: fullName,
                                    password: password
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
                        "verification_email",
                        email
                    );


                    registerForm.reset();


                    setTimeout(
                        function () {

                            window.location.href =
                                "/verify-otp/";

                        },
                        1000
                    );


                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    showMessage(
                        "Unable to register. Please try again.",
                        "danger"
                    );


                } finally {

                    registerButton.disabled = false;

                    registerButton.textContent =
                        "Register";

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
                result.email &&
                Array.isArray(result.email)
            ) {

                return result.email[0];

            }


            if (
                result.password &&
                Array.isArray(result.password)
            ) {

                return result.password[0];

            }


            if (
                result.full_name &&
                Array.isArray(result.full_name)
            ) {

                return result.full_name[0];

            }


            if (typeof result === "string") {

                return result;

            }


            return "Registration failed.";

        }

    }
);