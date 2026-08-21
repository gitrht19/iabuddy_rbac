document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutButton =
            document.getElementById(
                "logout-button"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutUser
            );

        }


        if (
            AuthManager.isAuthenticated()
        ) {

            loadNavbarUser();

        }

    }
);


/*
    Load logged-in user's profile
*/

async function loadNavbarUser() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    const userNameElement =
        document.getElementById(
            "navbar-user-name"
        );

    const profileNameElement =
        document.getElementById(
            "profile-card-name"
        );

    const profileEmailElement =
        document.getElementById(
            "profile-card-email"
        );

    const profileAccountElement =
        document.getElementById(
            "profile-card-account-id"
        );


    if (
        !userNameElement ||
        !profileNameElement ||
        !profileEmailElement ||
        !profileAccountElement
    ) {

        return;

    }


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


        /*
            Access token expired / invalid
        */

        if (
            response.status === 401
        ) {

            clearAuthentication();

            window.location.replace(
                "/login/"
            );

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Unable to load user profile."
            );

        }


        const result =
            await response.json();


        /*
            Update navbar name
        */

        userNameElement.textContent =
            result.full_name ||
            result.email;


        /*
            Update profile card
        */

        profileNameElement.textContent =
            result.full_name ||
            result.email;


        profileEmailElement.textContent =
            result.email;


        profileAccountElement.textContent =
            result.account_id;


        /*
            Initialize profile editing
        */

        initializeProfileEditing();


    } catch (error) {

        console.error(
            "Navbar user loading error:",
            error
        );

    }

}


/*
    Profile Edit Functionality
*/

function initializeProfileEditing() {

    const editButton =
        document.getElementById(
            "edit-profile-button"
        );

    const saveButton =
        document.getElementById(
            "save-profile-button"
        );

    const cancelButton =
        document.getElementById(
            "cancel-profile-button"
        );


    if (
        !editButton ||
        !saveButton ||
        !cancelButton
    ) {

        return;

    }


    /*
        Edit button

        Stop Bootstrap dropdown
        from closing.
    */

    editButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const currentName =
                document.getElementById(
                    "profile-card-name"
                ).textContent;


            document.getElementById(
                "profile-full-name"
            ).value =
                currentName;


            document.getElementById(
                "profile-view-mode"
            ).classList.add(
                "d-none"
            );


            document.getElementById(
                "profile-edit-mode"
            ).classList.remove(
                "d-none"
            );

        }
    );


    /*
        Cancel button
    */

    cancelButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            document.getElementById(
                "profile-edit-mode"
            ).classList.add(
                "d-none"
            );


            document.getElementById(
                "profile-view-mode"
            ).classList.remove(
                "d-none"
            );

        }
    );


    /*
        Save button
    */

    saveButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            saveProfile();

        }
    );

}


/*
    Update profile
*/

async function saveProfile() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    const fullName =
        document.getElementById(
            "profile-full-name"
        ).value.trim();


    const saveButton =
        document.getElementById(
            "save-profile-button"
        );


    /*
        Validate name
    */

    if (!fullName) {

        return;

    }


    saveButton.disabled = true;

    saveButton.innerHTML =
        '<span class="spinner-border spinner-border-sm me-1"></span> Saving...';


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


        /*
            Authentication failed
        */

        if (
            response.status === 401
        ) {

            clearAuthentication();

            window.location.replace(
                "/login/"
            );

            return;

        }


        const result =
            await response.json();


        /*
            API error
        */

        if (!response.ok) {

            console.error(
                "Profile update failed:",
                result
            );

            return;

        }


        /*
            Update navbar name
        */

        document.getElementById(
            "navbar-user-name"
        ).textContent =
            result.full_name;


        /*
            Update profile card name
        */

        document.getElementById(
            "profile-card-name"
        ).textContent =
            result.full_name;


        /*
            Exit edit mode
        */

        document.getElementById(
            "profile-edit-mode"
        ).classList.add(
            "d-none"
        );


        document.getElementById(
            "profile-view-mode"
        ).classList.remove(
            "d-none"
        );


    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );

    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            "Save";

    }

}


/*
    Logout
*/

async function logoutUser() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );

    const refreshToken =
        localStorage.getItem(
            "refresh_token"
        );


    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    /*
        Tokens missing
    */

    if (
        !accessToken ||
        !refreshToken
    ) {

        clearAuthentication();

        window.location.replace(
            "/login/"
        );

        return;

    }


    /*
        Logout loading state
    */

    logoutButton.disabled = true;

    logoutButton.innerHTML =
        '<span class="spinner-border spinner-border-sm me-1"></span> Logging out...';


    try {

        await fetch(
            "/accounts/logout/",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${accessToken}`,

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    refresh: refreshToken
                })
            }
        );


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


    } finally {

        clearAuthentication();

        window.location.replace(
            "/login/"
        );

    }

}


/*
    Clear authentication data
*/

function clearAuthentication() {

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "refresh_token"
    );

}