document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!AuthManager.protectPage()) {

            return;

        }

        loadDashboard();

    }
);


async function loadDashboard() {

    const loadingElement =
        document.getElementById(
            "dashboard-loading"
        );

    const contentElement =
        document.getElementById(
            "dashboard-content"
        );


    loadingElement.classList.add(
        "d-none"
    );

    contentElement.classList.remove(
        "d-none"
    );

}