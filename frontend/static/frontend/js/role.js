(function () {

    let editingRoleId = null;
    let selectedPermissionRoleId = null;


    const rolesTableBody =
        document.getElementById("roles-table-body");

    const createRoleButton =
        document.getElementById("create-role-button");

    const saveRoleButton =
        document.getElementById("save-role-button");

    const roleModalElement =
        document.getElementById("roleModal");

    const roleModal =
        roleModalElement
            ? new bootstrap.Modal(roleModalElement)
            : null;

    const roleModalTitle =
        document.getElementById("role-modal-title");

    const roleName =
        document.getElementById("role-name");

    const roleDescription =
        document.getElementById("role-description");

    const rolesMessage =
        document.getElementById("roles-message");

    const roleModalMessage =
        document.getElementById("role-modal-message");


    /*
        Authentication
    */

    function getAccessToken() {

        return localStorage.getItem(
            "access_token"
        );

    }


    /*
        Messages
    */

    function showMessage(
        element,
        message,
        type = "danger"
    ) {

        if (!element) {
            return;
        }

        element.textContent = message;

        element.className =
            `alert alert-${type}`;

    }


    function hideMessage(element) {

        if (!element) {
            return;
        }

        element.classList.add("d-none");

    }


    /*
        API Request
    */

    async function apiRequest(
        url,
        options = {}
    ) {

        const accessToken =
            getAccessToken();


        if (!accessToken) {

            window.location.replace(
                "/login/"
            );

            return null;

        }


        const headers = {

            "Authorization":
                `Bearer ${accessToken}`,

            "Content-Type":
                "application/json",

            ...(options.headers || {})

        };


        const response =
            await fetch(
                url,
                {
                    ...options,
                    headers: headers
                }
            );


        if (response.status === 401) {

            if (
                typeof clearAuthentication ===
                "function"
            ) {

                clearAuthentication();

            }

            window.location.replace(
                "/login/"
            );

            return null;

        }


        return response;

    }


    /*
        Load Roles
    */

    async function loadRoles() {

        if (!rolesTableBody) {
            return;
        }


        rolesTableBody.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="text-center text-muted py-4">

                    Loading roles...

                </td>
            </tr>
        `;


        try {

            const response =
                await apiRequest(
                    "/access-control/roles/"
                );


            if (!response) {
                return;
            }


            if (response.status === 403) {

                rolesTableBody.innerHTML = `
                    <tr>
                        <td
                            colspan="3"
                            class="text-center text-danger py-4">

                            You don't have permission
                            to view roles.

                        </td>
                    </tr>
                `;

                return;

            }


            if (!response.ok) {

                throw new Error(
                    "Unable to load roles."
                );

            }


            const result =
                await response.json();


            const roles =
                result.data &&
                Array.isArray(result.data)
                    ? result.data
                    : [];


            renderRoles(roles);


        } catch (error) {

            console.error(
                "Roles loading error:",
                error
            );


            rolesTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="3"
                        class="text-center text-danger py-4">

                        Unable to load roles.

                    </td>
                </tr>
            `;

        }

    }


    /*
        Render Roles
    */

    function renderRoles(roles) {

        rolesTableBody.innerHTML = "";


        if (!roles.length) {

            rolesTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="3"
                        class="text-center text-muted py-4">

                        No roles found.

                    </td>
                </tr>
            `;

            return;

        }


        roles.forEach(function (role) {

            const row =
                document.createElement("tr");


            /*
                Name
            */

            const nameCell =
                document.createElement("td");

            nameCell.textContent =
                role.name;


            /*
                Description
            */

            const descriptionCell =
                document.createElement("td");

            descriptionCell.textContent =
                role.description || "—";


            /*
                Actions
            */

            const actionsCell =
                document.createElement("td");

            actionsCell.classList.add(
                "text-end"
            );


            /*
                Edit Button
            */

            const editButton =
                document.createElement("button");

            editButton.type = "button";

            editButton.classList.add(
                "btn",
                "btn-sm",
                "btn-outline-primary",
                "me-2"
            );

            editButton.innerHTML = `
                <i class="bi bi-pencil"></i>
                Edit
            `;


            editButton.addEventListener(
                "click",
                function () {

                    openEditRoleModal(role);

                }
            );


            /*
                Permission Button
            */

            const permissionButton =
                document.createElement("button");

            permissionButton.type = "button";

            permissionButton.classList.add(
                "btn",
                "btn-sm",
                "btn-outline-secondary"
            );

            permissionButton.innerHTML = `
                <i class="bi bi-key"></i>
                Permissions
            `;


            permissionButton.addEventListener(
                "click",
                function () {

                    openPermissionManager(role);

                }
            );


            actionsCell.appendChild(
                editButton
            );

            actionsCell.appendChild(
                permissionButton
            );


            row.appendChild(
                nameCell
            );

            row.appendChild(
                descriptionCell
            );

            row.appendChild(
                actionsCell
            );


            rolesTableBody.appendChild(
                row
            );

        });

    }


    /*
        Permission Modal
    */

    function createPermissionModal() {

        let modalElement =
            document.getElementById(
                "permissionModal"
            );


        if (modalElement) {

            return new bootstrap.Modal(
                modalElement
            );

        }


        modalElement =
            document.createElement("div");

        modalElement.id =
            "permissionModal";

        modalElement.className =
            "modal fade";

        modalElement.tabIndex =
            -1;

        modalElement.setAttribute(
            "aria-hidden",
            "true"
        );


        modalElement.innerHTML = `

            <div class="modal-dialog modal-lg">

                <div class="modal-content">

                    <div class="modal-header">

                        <h5
                            class="modal-title"
                            id="permission-modal-title">

                            Manage Permissions

                        </h5>


                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal">
                        </button>

                    </div>


                    <div class="modal-body">

                        <div
                            id="permission-modal-message"
                            class="alert d-none"
                            role="alert">
                        </div>


                        <div class="mb-4">

                            <label
                                for="permission-select"
                                class="form-label">

                                Assign Permission

                            </label>


                            <div class="input-group">

                                <select
                                    id="permission-select"
                                    class="form-select">

                                    <option value="">
                                        Loading permissions...
                                    </option>

                                </select>


                                <button
                                    type="button"
                                    id="assign-permission-button"
                                    class="btn btn-primary">

                                    Assign

                                </button>

                            </div>

                        </div>


                        <div>

                            <label class="form-label">

                                Assigned Permissions

                            </label>


                            <div
                                id="current-permissions">

                                <span class="text-muted">

                                    Loading...

                                </span>

                            </div>

                        </div>

                    </div>


                    <div class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-bs-dismiss="modal">

                            Close

                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modalElement
        );


        const assignButton =
            document.getElementById(
                "assign-permission-button"
            );


        assignButton.addEventListener(
            "click",
            assignPermission
        );


        return new bootstrap.Modal(
            modalElement
        );

    }


    /*
        Open Permission Manager
    */

    async function openPermissionManager(role) {

        selectedPermissionRoleId =
            role.id;


        const modal =
            createPermissionModal();


        const title =
            document.getElementById(
                "permission-modal-title"
            );


        title.textContent =
            `Manage Permissions - ${role.name}`;


        const message =
            document.getElementById(
                "permission-modal-message"
            );


        hideMessage(message);


        modal.show();


        await Promise.all([
            loadPermissions(),
            loadRolePermissions(role.id)
        ]);

    }


    /*
        Load All Permissions
    */

    async function loadPermissions() {

        const permissionSelect =
            document.getElementById(
                "permission-select"
            );


        if (!permissionSelect) {
            return;
        }


        permissionSelect.innerHTML = `
            <option value="">
                Loading permissions...
            </option>
        `;


        try {

            const response =
                await apiRequest(
                    "/access-control/list-permissions/"
                );


            if (!response) {
                return;
            }


            if (response.status === 403) {

                permissionSelect.innerHTML = `
                    <option value="">
                        You don't have permission
                    </option>
                `;

                return;

            }


            if (!response.ok) {

                throw new Error(
                    "Unable to load permissions."
                );

            }


            const result =
                await response.json();


            const permissions =
                result.data &&
                Array.isArray(result.data)
                    ? result.data
                    : [];


            permissionSelect.innerHTML = `
                <option value="">
                    Select a permission
                </option>
            `;


            permissions.forEach(
                function (permission) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        permission.id;


                    option.textContent =
                        permission.code
                            ? `${permission.name} (${permission.code})`
                            : permission.name;


                    permissionSelect.appendChild(
                        option
                    );

                }
            );


        } catch (error) {

            console.error(
                "Permissions loading error:",
                error
            );


            permissionSelect.innerHTML = `
                <option value="">
                    Unable to load permissions
                </option>
            `;

        }

    }


    /*
        Load Role Permissions
    */

    async function loadRolePermissions(roleId) {

        const container =
            document.getElementById(
                "current-permissions"
            );


        if (!container) {
            return;
        }


        container.innerHTML = `
            <span class="text-muted">
                Loading...
            </span>
        `;


        try {

            const response =
                await apiRequest(
                    `/access-control/list/roles/permissions/${roleId}/`
                );


            if (!response) {
                return;
            }


            if (response.status === 403) {

                container.innerHTML = `
                    <span class="text-danger">
                        You don't have permission
                        to view permissions.
                    </span>
                `;

                return;

            }


            if (!response.ok) {

                throw new Error(
                    "Unable to load role permissions."
                );

            }


            const result =
                await response.json();


            const permissions =
                result.data &&
                Array.isArray(
                    result.data.permissions
                )
                    ? result.data.permissions
                    : [];


            container.innerHTML = "";


            if (!permissions.length) {

                container.innerHTML = `
                    <span class="text-muted">
                        No permissions assigned.
                    </span>
                `;

                return;

            }


            permissions.forEach(
                function (permission) {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.classList.add(
                        "d-flex",
                        "justify-content-between",
                        "align-items-center",
                        "border",
                        "rounded",
                        "p-2",
                        "mb-2"
                    );


                    const permissionInfo =
                        document.createElement(
                            "div"
                        );


                    const name =
                        document.createElement(
                            "div"
                        );


                    name.classList.add(
                        "fw-semibold"
                    );


                    name.textContent =
                        permission.name;


                    const code =
                        document.createElement(
                            "small"
                        );


                    code.classList.add(
                        "text-muted",
                        "d-block"
                    );


                    code.textContent =
                        permission.code || "";


                    permissionInfo.appendChild(
                        name
                    );

                    permissionInfo.appendChild(
                        code
                    );


                    const removeButton =
                        document.createElement(
                            "button"
                        );


                    removeButton.type =
                        "button";


                    removeButton.classList.add(
                        "btn",
                        "btn-sm",
                        "btn-outline-danger"
                    );


                    removeButton.innerHTML = `
                        <i class="bi bi-x-circle"></i>
                        Remove
                    `;


                    removeButton.addEventListener(
                        "click",
                        function () {

                            removePermission(
                                roleId,
                                permission.id
                            );

                        }
                    );


                    row.appendChild(
                        permissionInfo
                    );

                    row.appendChild(
                        removeButton
                    );


                    container.appendChild(
                        row
                    );

                }
            );


        } catch (error) {

            console.error(
                "Role permissions loading error:",
                error
            );


            container.innerHTML = `
                <span class="text-danger">
                    Unable to load permissions.
                </span>
            `;

        }

    }


    /*
        Assign Permission
    */

    async function assignPermission() {

        if (!selectedPermissionRoleId) {
            return;
        }


        const permissionSelect =
            document.getElementById(
                "permission-select"
            );


        const permissionId =
            permissionSelect.value;


        if (!permissionId) {

            showMessage(
                document.getElementById(
                    "permission-modal-message"
                ),
                "Please select a permission.",
                "warning"
            );

            return;

        }


        const assignButton =
            document.getElementById(
                "assign-permission-button"
            );


        assignButton.disabled =
            true;


        try {

            const response =
                await apiRequest(
                    `/access-control/assign/roles/permissions/${selectedPermissionRoleId}/`,
                    {
                        method: "POST",

                        body: JSON.stringify({
                            permission_id:
                                Number(permissionId)
                        })
                    }
                );


            if (!response) {
                return;
            }


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to assign permission."
                );

            }


            showMessage(
                document.getElementById(
                    "permission-modal-message"
                ),
                result.message ||
                "Permission assigned successfully.",
                "success"
            );


            permissionSelect.value = "";


            await loadRolePermissions(
                selectedPermissionRoleId
            );


        } catch (error) {

            console.error(
                "Permission assignment error:",
                error
            );


            showMessage(
                document.getElementById(
                    "permission-modal-message"
                ),
                error.message ||
                "Unable to assign permission.",
                "danger"
            );

        } finally {

            assignButton.disabled =
                false;

        }

    }


    /*
        Remove Permission
    */

    async function removePermission(
        roleId,
        permissionId
    ) {

        try {

            const response =
                await apiRequest(
                    `/access-control/remove/roles/permissions/${roleId}/`,
                    {
                        method: "DELETE",

                        body: JSON.stringify({
                            permission_id:
                                permissionId
                        })
                    }
                );


            if (!response) {
                return;
            }


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to remove permission."
                );

            }


            showMessage(
                document.getElementById(
                    "permission-modal-message"
                ),
                result.message ||
                "Permission removed successfully.",
                "success"
            );


            await loadRolePermissions(
                roleId
            );


        } catch (error) {

            console.error(
                "Permission removal error:",
                error
            );


            showMessage(
                document.getElementById(
                    "permission-modal-message"
                ),
                error.message ||
                "Unable to remove permission.",
                "danger"
            );

        }

    }


    /*
        Create Role Modal
    */

    function openCreateRoleModal() {

        editingRoleId = null;


        hideMessage(
            roleModalMessage
        );


        roleModalTitle.textContent =
            "Create Role";


        roleName.value = "";


        roleDescription.value = "";


        saveRoleButton.textContent =
            "Create Role";


        if (roleModal) {

            roleModal.show();

        }

    }


    /*
        Edit Role Modal
    */

    function openEditRoleModal(role) {

        editingRoleId =
            role.id;


        hideMessage(
            roleModalMessage
        );


        roleModalTitle.textContent =
            "Update Role";


        roleName.value =
            role.name;


        roleDescription.value =
            role.description || "";


        saveRoleButton.textContent =
            "Update Role";


        if (roleModal) {

            roleModal.show();

        }

    }


    /*
        Save Role
    */

    async function saveRole() {

        const name =
            roleName.value.trim();


        const description =
            roleDescription.value.trim();


        if (!name) {

            showMessage(
                roleModalMessage,
                "Role name is required.",
                "warning"
            );

            return;

        }


        saveRoleButton.disabled =
            true;


        hideMessage(
            roleModalMessage
        );


        try {

            let url;
            let method;


            if (editingRoleId) {

                url =
                    `/access-control/update/roles/${editingRoleId}/`;

                method =
                    "PUT";

            } else {

                url =
                    "/access-control/create/roles/";

                method =
                    "POST";

            }


            const response =
                await apiRequest(
                    url,
                    {
                        method: method,

                        body: JSON.stringify({
                            name: name,
                            description: description
                        })
                    }
                );


            if (!response) {
                return;
            }


            const result =
                await response.json();


            if (response.status === 403) {

                showMessage(
                    roleModalMessage,
                    "You don't have permission to perform this action.",
                    "danger"
                );

                return;

            }


            if (!response.ok) {

                let message =
                    "Unable to save role.";


                if (result.message) {

                    message =
                        result.message;

                }


                if (result.name) {

                    message =
                        Array.isArray(result.name)
                            ? result.name[0]
                            : result.name;

                }


                showMessage(
                    roleModalMessage,
                    message,
                    "danger"
                );

                return;

            }


            showMessage(
                rolesMessage,
                result.message ||
                "Role saved successfully.",
                "success"
            );


            if (roleModal) {

                roleModal.hide();

            }


            await loadRoles();


        } catch (error) {

            console.error(
                "Role save error:",
                error
            );


            showMessage(
                roleModalMessage,
                "Unable to save role.",
                "danger"
            );


        } finally {

            saveRoleButton.disabled =
                false;

        }

    }


    /*
        Event Listeners
    */

    if (createRoleButton) {

        createRoleButton.addEventListener(
            "click",
            openCreateRoleModal
        );

    }


    if (saveRoleButton) {

        saveRoleButton.addEventListener(
            "click",
            saveRole
        );

    }


    /*
        Initial Load
    */

    function initializeRolesPage() {

        if (
            typeof AuthManager !== "undefined" &&
            !AuthManager.isAuthenticated()
        ) {

            return;

        }


        loadRoles();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeRolesPage
        );

    } else {

        initializeRolesPage();

    }


})();