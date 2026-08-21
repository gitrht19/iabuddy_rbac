document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById(
                "login-form"
            );

        const loginButton =
            document.getElementById(
                "login-button"
            );

        const messageElement =
            document.getElementById(
                "login-message"
            );


        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "email"
                    ).value.trim();

                const password =
                    document.getElementById(
                        "password"
                    ).value;


                hideMessage();

                loginButton.disabled = true;

                loginButton.textContent =
                    "Logging in...";


                try {

                    const response =
                        await fetch(
                            "/accounts/login/",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
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


                    localStorage.setItem(
                        "access_token",
                        result.access
                    );


                    localStorage.setItem(
                        "refresh_token",
                        result.refresh
                    );


                    showMessage(
                        result.message,
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "/dashboard/";

                        },
                        500
                    );


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    showMessage(
                        "Unable to login. Please try again.",
                        "danger"
                    );


                } finally {

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";

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


            return "Login failed.";

        }

    }
);