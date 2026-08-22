document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!AuthManager.isAuthenticated()) {

            return;

        }

        loadSidebarModules();

    }
);


/*
    Load sidebar modules from backend
*/

async function loadSidebarModules() {

    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    const sidebar =
        document.getElementById(
            "authenticated-sidebar"
        );

    const loadingElement =
        document.getElementById(
            "sidebar-loading"
        );

    const menuElement =
        document.getElementById(
            "sidebar-menu"
        );


    if (
        !sidebar ||
        !loadingElement ||
        !menuElement
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                "/access-control/user/modules/",
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


        /*
            Access denied
        */

        if (
            response.status === 403
        ) {

            loadingElement.textContent =
                "Unable to load modules.";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Unable to load sidebar modules."
            );

        }


        const result =
            await response.json();


        const modules =
            Array.isArray(
                result.modules
            )
                ? result.modules
                : [];


        /*
            Clear existing menu
        */

        menuElement.innerHTML = "";


        /*
            Render modules received
            from backend
        */

        modules.forEach(
            function (module) {

                const menuItem =
                    createSidebarItem(
                        module
                    );

                menuElement.appendChild(
                    menuItem
                );

            }
        );


        /*
            Hide loading state
        */

        loadingElement.classList.add(
            "d-none"
        );


        /*
            Show menu
        */

        menuElement.classList.remove(
            "d-none"
        );


        /*
            Show authenticated sidebar
        */

        sidebar.classList.remove(
            "d-none"
        );


    } catch (error) {

        console.error(
            "Sidebar loading error:",
            error
        );


        loadingElement.textContent =
            "Unable to load modules.";

    }

}


/*
    Create sidebar item dynamically
*/

function createSidebarItem(module) {

    const item =
        document.createElement(
            "a"
        );


    item.classList.add(
        "nav-link",
        "d-flex",
        "align-items-center",
        "gap-2"
    );


    /*
        Module has access
    */

    if (module.has_access) {

        item.href =
            module.url;

        item.classList.add(
            "text-dark"
        );


        /*
            Active module

            Compare current browser URL
            with the URL received from backend.
        */

        const currentPath =
            window.location.pathname;


        if (
            currentPath === module.url
        ) {

            item.classList.add(
                "active"
            );

        }

    }


    /*
        Module does not have access
    */

    else {

        item.href =
            "#";

        item.classList.add(
            "text-muted"
        );


        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showModuleAccessMessage();

            }
        );

    }


    /*
        Module icon
    */

    const icon =
        document.createElement(
            "i"
        );


    icon.classList.add(
        "bi",
        module.icon
    );


    /*
        Module name
    */

    const name =
        document.createElement(
            "span"
        );


    name.textContent =
        module.name;


    item.appendChild(
        icon
    );


    item.appendChild(
        name
    );


    /*
        Locked indicator
    */

    if (!module.has_access) {

        const lockIcon =
            document.createElement(
                "i"
            );


        lockIcon.classList.add(
            "bi",
            "bi-lock",
            "ms-auto"
        );


        item.appendChild(
            lockIcon
        );

    }


    return item;

}

/*
    Show access denied message
*/

function showModuleAccessMessage() {

    let messageElement =
        document.getElementById(
            "module-access-message"
        );


    /*
        Create message dynamically
        if it does not already exist
    */

    if (!messageElement) {

        messageElement =
            document.createElement(
                "div"
            );


        messageElement.id =
            "module-access-message";


        messageElement.classList.add(
            "alert",
            "alert-warning",
            "position-fixed",
            "top-0",
            "end-0",
            "m-3",
            "shadow"
        );


        messageElement.setAttribute(
            "role",
            "alert"
        );


        messageElement.textContent =
            "You don't have access to this module.";


        document.body.appendChild(
            messageElement
        );

    }


    /*
        Show message
    */

    messageElement.classList.remove(
        "d-none"
    );


    /*
        Automatically hide message
    */

    setTimeout(
        function () {

            messageElement.classList.add(
                "d-none"
            );

        },
        3000
    );

}