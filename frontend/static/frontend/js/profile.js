document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!AuthManager.protectPage()) {

            return;

        }


        loadProfile();


        const profileForm =
            document.getElementById(
                "profile-form"
            );


        profileForm.addEventListener(
            "submit",
            updateProfile
        );

    }
);


async function loadProfile() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    const loadingElement =
        document.getElementById(
            "profile-loading"
        );

    const contentElement =
        document.getElementById(
            "profile-content"
        );

    const errorElement =
        document.getElementById(
            "profile-error"
        );


    try {

        const response =
            await fetch(
                "/accounts/profile/",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            window.location.replace(
                "/login/"
            );

            return;

        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                getErrorMessage(result)
            );

        }


        document.getElementById(
            "account-id"
        ).value =
            result.account_id;


        document.getElementById(
            "email"
        ).value =
            result.email;


        document.getElementById(
            "full-name"
        ).value =
            result.full_name;


        loadingElement.classList.add(
            "d-none"
        );

        contentElement.classList.remove(
            "d-none"
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        loadingElement.classList.add(
            "d-none"
        );

        errorElement.textContent =
            error.message ||
            "Unable to load profile.";

        errorElement.classList.remove(
            "d-none"
        );

    }

}


async function updateProfile(
    event
) {

    event.preventDefault();


    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    const fullName =
        document.getElementById(
            "full-name"
        ).value.trim();


    const saveButton =
        document.getElementById(
            "profile-save-button"
        );


    hideProfileMessage();


    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";


    try {

        const response =
            await fetch(
                "/accounts/profile/",
                {
                    method: "PATCH",

                    headers: {
                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        full_name: fullName
                    })
                }
            );


        const result =
            await response.json();


        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            localStorage.removeItem(
                "refresh_token"
            );

            window.location.replace(
                "/login/"
            );

            return;

        }


        if (!response.ok) {

            showProfileMessage(
                getErrorMessage(result),
                "danger"
            );

            return;

        }


        document.getElementById(
            "full-name"
        ).value =
            result.full_name;


        showProfileMessage(
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        showProfileMessage(
            "Unable to update profile. Please try again.",
            "danger"
        );


    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            "Save Changes";

    }

}


function showProfileMessage(
    message,
    type
) {

    const messageElement =
        document.getElementById(
            "profile-message"
        );


    messageElement.textContent =
        message;

    messageElement.className =
        `alert alert-${type}`;

}


function hideProfileMessage() {

    const messageElement =
        document.getElementById(
            "profile-message"
        );


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


    return "Something went wrong.";

}