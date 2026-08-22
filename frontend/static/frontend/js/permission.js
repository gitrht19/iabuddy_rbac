const PermissionManager = {

    permissions: new Set(),


    async load() {

        const accessToken =
            localStorage.getItem(
                "access_token"
            );


        if (!accessToken) {

            return false;

        }


        try {

            const response =
                await fetch(
                    "/access-control/me/permissions/",
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


            if (
                response.status === 401
            ) {

                clearAuthentication();

                window.location.replace(
                    "/login/"
                );

                return false;

            }


            if (!response.ok) {

                throw new Error(
                    "Unable to load permissions."
                );

            }


            const result =
                await response.json();


            this.permissions =
                new Set(
                    Array.isArray(
                        result.permissions
                    )
                        ? result.permissions
                        : []
                );


            return true;


        } catch (error) {

            console.error(
                "Permission loading error:",
                error
            );


            this.permissions =
                new Set();


            return false;

        }

    },


    has(permissionCode) {

        return this.permissions.has(
            permissionCode
        );

    },


    hasAny(permissionCodes) {

        return permissionCodes.some(
            permissionCode =>
                this.permissions.has(
                    permissionCode
                )
        );

    },


    hasAll(permissionCodes) {

        return permissionCodes.every(
            permissionCode =>
                this.permissions.has(
                    permissionCode
                )
        );

    },


    clear() {

        this.permissions.clear();

    }

};


/*
    Initialize Permissions Page
*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (
            !AuthManager.isAuthenticated()
        ) {

            return;

        }


        const permissionsLoaded =
            await PermissionManager.load();


        if (!permissionsLoaded) {

            return;

        }


        const permissionsTableBody =
            document.getElementById(
                "permissions-table-body"
            );


        if (
            permissionsTableBody
        ) {

            loadPermissions();

        }


        initializeCreatePermission();

    }
);


/*
    Initialize Create Permission
*/

function initializeCreatePermission() {

    const createButton =
        document.getElementById(
            "create-permission-button"
        );


    const saveButton =
        document.getElementById(
            "save-permission-button"
        );


    if (!createButton) {

        return;

    }


    /*
        Hide create button when
        user does not have permission
    */

    if (
        !PermissionManager.has(
            "permission.create"
        )
    ) {

        createButton.classList.add(
            "d-none"
        );

        return;

    }


    createButton.addEventListener(
        "click",
        function () {

            openCreatePermissionModal();

        }
    );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            function () {

                createPermission();

            }
        );

    }

}


/*
    Open Create Permission Modal
*/

function openCreatePermissionModal() {

    const nameInput =
        document.getElementById(
            "permission-name"
        );


    const codeInput =
        document.getElementById(
            "permission-code"
        );


    const descriptionInput =
        document.getElementById(
            "permission-description"
        );


    const modalMessage =
        document.getElementById(
            "permission-modal-message"
        );


    if (nameInput) {

        nameInput.value = "";

    }


    if (codeInput) {

        codeInput.value = "";

    }


    if (descriptionInput) {

        descriptionInput.value = "";

    }


    if (modalMessage) {

        modalMessage.className =
            "alert d-none";

        modalMessage.textContent =
            "";

    }


    const modalElement =
        document.getElementById(
            "permissionModal"
        );


    if (!modalElement) {

        return;

    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


/*
    Create Permission
*/

async function createPermission() {

    const nameInput =
        document.getElementById(
            "permission-name"
        );


    const codeInput =
        document.getElementById(
            "permission-code"
        );


    const descriptionInput =
        document.getElementById(
            "permission-description"
        );


    if (
        !nameInput ||
        !codeInput ||
        !descriptionInput
    ) {

        return;

    }


    const name =
        nameInput.value.trim();


    const code =
        codeInput.value.trim();


    const description =
        descriptionInput.value.trim();


    if (!name) {

        showPermissionModalMessage(
            "Permission name is required.",
            "danger"
        );

        return;

    }


    if (!code) {

        showPermissionModalMessage(
            "Permission code is required.",
            "danger"
        );

        return;

    }


    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    if (!accessToken) {

        clearAuthentication();

        window.location.replace(
            "/login/"
        );

        return;

    }


    const saveButton =
        document.getElementById(
            "save-permission-button"
        );


    if (saveButton) {

        saveButton.disabled = true;

    }


    try {

        const response =
            await fetch(
                "/access-control/create/permissions/",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                name: name,
                                code: code,
                                description: description
                            }
                        )
                }
            );


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


        if (!response.ok) {

            showPermissionModalMessage(
                result.message ||
                "Unable to create permission.",
                "danger"
            );

            return;

        }


        hidePermissionModal();


        showPermissionMessage(
            result.message ||
            "Permission created successfully.",
            "success"
        );


        await loadPermissions();


    } catch (error) {

        console.error(
            "Create permission error:",
            error
        );


        showPermissionModalMessage(
            "Unable to create permission.",
            "danger"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

        }

    }

}


/*
    Load Permissions From Backend
*/

async function loadPermissions() {

    const permissionsTableBody =
        document.getElementById(
            "permissions-table-body"
        );


    const permissionsMessage =
        document.getElementById(
            "permissions-message"
        );


    if (
        !permissionsTableBody
    ) {

        return;

    }


    const accessToken =
        localStorage.getItem(
            "access_token"
        );


    if (!accessToken) {

        return;

    }


    try {

        const response =
            await fetch(
                "/access-control/list-permissions/",
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


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load permissions."
            );

        }


        const permissions =
            result.data &&
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        renderPermissions(
            permissions
        );


    } catch (error) {

        console.error(
            "Permissions loading error:",
            error
        );


        permissionsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="text-center text-danger py-4">
                    Unable to load permissions.
                </td>
            </tr>
        `;


        if (
            permissionsMessage
        ) {

            permissionsMessage.textContent =
                error.message;

            permissionsMessage.className =
                "alert alert-danger";

        }

    }

}


/*
    Render Permissions Dynamically
*/

function renderPermissions(
    permissions
) {

    const permissionsTableBody =
        document.getElementById(
            "permissions-table-body"
        );


    if (
        !permissionsTableBody
    ) {

        return;

    }


    permissionsTableBody.innerHTML = "";


    if (!permissions.length) {

        permissionsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="text-center text-muted py-4">
                    No permissions found.
                </td>
            </tr>
        `;

        return;

    }


    permissions.forEach(
        function (permission) {

            const row =
                document.createElement(
                    "tr"
                );


            const nameCell =
                document.createElement(
                    "td"
                );


            nameCell.textContent =
                permission.name;


            const codeCell =
                document.createElement(
                    "td"
                );


            const code =
                document.createElement(
                    "code"
                );


            code.textContent =
                permission.code;


            codeCell.appendChild(
                code
            );


            const descriptionCell =
                document.createElement(
                    "td"
                );


            descriptionCell.textContent =
                permission.description ||
                "—";


            row.appendChild(
                nameCell
            );


            row.appendChild(
                codeCell
            );


            row.appendChild(
                descriptionCell
            );


            permissionsTableBody.appendChild(
                row
            );

        }
    );

}


/*
    Show Permission Page Message
*/

function showPermissionMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "permissions-message"
        );


    if (!element) {

        return;

    }


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;


    element.classList.remove(
        "d-none"
    );


    setTimeout(
        function () {

            element.classList.add(
                "d-none"
            );

        },
        4000
    );

}


/*
    Show Modal Message
*/

function showPermissionModalMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "permission-modal-message"
        );


    if (!element) {

        return;

    }


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;


    element.classList.remove(
        "d-none"
    );

}


/*
    Hide Permission Modal
*/

function hidePermissionModal() {

    const modalElement =
        document.getElementById(
            "permissionModal"
        );


    if (!modalElement) {

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );


    if (modal) {

        modal.hide();

    }

}