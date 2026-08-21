(function () {

    function isAuthenticated() {

        const accessToken =
            localStorage.getItem(
                "access_token"
            );

        const refreshToken =
            localStorage.getItem(
                "refresh_token"
            );

        return Boolean(
            accessToken &&
            refreshToken
        );

    }


    function protectPage() {

        if (!isAuthenticated()) {

            window.location.replace(
                "/login/"
            );

            return false;

        }

        return true;

    }


    function updateNavbar() {

        const navbar =
            document.getElementById(
                "authenticated-navbar"
            );


        if (!navbar) {

            return;

        }


        if (isAuthenticated()) {

            navbar.classList.remove(
                "d-none"
            );

        } else {

            navbar.classList.add(
                "d-none"
            );

        }

    }


    window.AuthManager = {

        isAuthenticated:
            isAuthenticated,

        protectPage:
            protectPage,

        updateNavbar:
            updateNavbar

    };


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            updateNavbar();

        }
    );

})();