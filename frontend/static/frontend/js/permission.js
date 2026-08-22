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
    Load permissions for
    authenticated users
*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (
            !AuthManager.isAuthenticated()
        ) {

            return;

        }


        await PermissionManager.load();


        /*
            Permissions page
        */

        const permissionsTableBody =
            document.getElementById(
                "permissions-table-body"
            );


        if (
            permissionsTableBody
        ) {

            loadPermissions();

        }

    }
);


/*
    Load permissions from backend
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
    Render permissions dynamically
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