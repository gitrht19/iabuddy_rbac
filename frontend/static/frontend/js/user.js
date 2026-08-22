(function () {

    let selectedUserId = null;

    const usersTableBody =
        document.getElementById(
            "users-table-body"
        );

    const roleModalElement =
        document.getElementById(
            "roleModal"
        );

    const roleModal =
        roleModalElement
            ? new bootstrap.Modal(
                roleModalElement
            )
            : null;

    const roleSelect =
        document.getElementById(
            "role-select"
        );

    const currentRoles =
        document.getElementById(
            "current-roles"
        );

    const assignRoleButton =
        document.getElementById(
            "assign-role-button"
        );

    const usersMessage =
        document.getElementById(
            "users-message"
        );

    const roleModalMessage =
        document.getElementById(
            "role-modal-message"
        );


    function getAccessToken() {

        return localStorage.getItem(
            "access_token"
        );

    }


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

        element.classList.add(
            "d-none"
        );

    }


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

            clearAuthentication();

            window.location.replace(
                "/login/"
            );

            return null;

        }


        return response;

    }


    async function loadUsers() {

        try {

            const response =
                await apiRequest(
                    "/access-control/users/"
                );


            if (!response) {
                return;
            }


            if (!response.ok) {

                throw new Error(
                    "Unable to load users."
                );

            }


            const result =
                await response.json();


            const users =
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];


            renderUsers(
                users
            );


        } catch (error) {

            console.error(
                "Users loading error:",
                error
            );


            if (usersTableBody) {

                usersTableBody.innerHTML = `
                    <tr>
                        <td
                            colspan="3"
                            class="text-center text-danger py-4">
                            Unable to load users.
                        </td>
                    </tr>
                `;

            }

        }

    }


    function renderUsers(users) {

        if (!usersTableBody) {
            return;
        }


        usersTableBody.innerHTML = "";


        if (!users.length) {

            usersTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="3"
                        class="text-center text-muted py-4">
                        No users found.
                    </td>
                </tr>
            `;

            return;

        }


        users.forEach(
            function (user) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const emailCell =
                    document.createElement(
                        "td"
                    );

                emailCell.textContent =
                    user.email;


                const rolesCell =
                    document.createElement(
                        "td"
                    );

                rolesCell.id =
                    `roles-${user.account_id}`;

                rolesCell.innerHTML = `
                    <span class="text-muted">
                        Loading...
                    </span>
                `;


                const actionsCell =
                    document.createElement(
                        "td"
                    );

                actionsCell.classList.add(
                    "text-end"
                );


                const manageButton =
                    document.createElement(
                        "button"
                    );

                manageButton.type =
                    "button";

                manageButton.classList.add(
                    "btn",
                    "btn-sm",
                    "btn-outline-primary"
                );

                manageButton.innerHTML = `
                    <i class="bi bi-shield-check"></i>
                    Manage Roles
                `;


                manageButton.addEventListener(
                    "click",
                    function () {

                        openRoleManager(
                            user.account_id,
                            user.email
                        );

                    }
                );


                actionsCell.appendChild(
                    manageButton
                );


                row.appendChild(
                    emailCell
                );

                row.appendChild(
                    rolesCell
                );

                row.appendChild(
                    actionsCell
                );


                usersTableBody.appendChild(
                    row
                );


                loadUserRoles(
                    user.account_id,
                    rolesCell
                );

            }
        );

    }


    async function loadUserRoles(
        userId,
        rolesCell
    ) {

        try {

            const response =
                await apiRequest(
                    `/access-control/users/roles/?user_id=${encodeURIComponent(userId)}`
                );


            if (!response) {
                return;
            }


            if (!response.ok) {

                throw new Error(
                    "Unable to load user roles."
                );

            }


            const result =
                await response.json();


            const roles =
                result.data &&
                Array.isArray(
                    result.data.roles
                )
                    ? result.data.roles
                    : [];


            if (!roles.length) {

                rolesCell.innerHTML = `
                    <span class="text-muted">
                        No role assigned
                    </span>
                `;

                return;

            }


            rolesCell.innerHTML = "";


            roles.forEach(
                function (role) {

                    const badge =
                        document.createElement(
                            "span"
                        );

                    badge.classList.add(
                        "badge",
                        "bg-primary",
                        "me-1"
                    );

                    badge.textContent =
                        role.name;

                    rolesCell.appendChild(
                        badge
                    );

                }
            );


        } catch (error) {

            console.error(
                "User roles loading error:",
                error
            );

            rolesCell.innerHTML = `
                <span class="text-danger">
                    Unable to load
                </span>
            `;

        }

    }


    async function loadRoles() {

        if (!roleSelect) {
            return;
        }


        roleSelect.innerHTML = `
            <option value="">
                Loading roles...
            </option>
        `;


        try {

            const response =
                await apiRequest(
                    "/access-control/roles/"
                );


            if (!response) {
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
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];


            roleSelect.innerHTML = `
                <option value="">
                    Select a role
                </option>
            `;


            roles.forEach(
                function (role) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        role.id;

                    option.textContent =
                        role.name;

                    roleSelect.appendChild(
                        option
                    );

                }
            );


        } catch (error) {

            console.error(
                "Roles loading error:",
                error
            );


            roleSelect.innerHTML = `
                <option value="">
                    Unable to load roles
                </option>
            `;

        }

    }


    async function openRoleManager(
        userId,
        email
    ) {

        selectedUserId =
            userId;


        hideMessage(
            roleModalMessage
        );


        if (roleModal) {

            roleModal.show();

        }


        await Promise.all([
            loadRoles(),
            loadCurrentRoles(
                userId
            )
        ]);

    }


    async function loadCurrentRoles(
        userId
    ) {

        if (!currentRoles) {
            return;
        }


        currentRoles.innerHTML = `
            <span class="text-muted">
                Loading...
            </span>
        `;


        try {

            const response =
                await apiRequest(
                    `/access-control/users/roles/?user_id=${encodeURIComponent(userId)}`
                );


            if (!response) {
                return;
            }


            if (!response.ok) {

                throw new Error(
                    "Unable to load current roles."
                );

            }


            const result =
                await response.json();


            const roles =
                result.data &&
                Array.isArray(
                    result.data.roles
                )
                    ? result.data.roles
                    : [];


            currentRoles.innerHTML = "";


            if (!roles.length) {

                currentRoles.innerHTML = `
                    <span class="text-muted">
                        No role assigned
                    </span>
                `;

                return;

            }


            roles.forEach(
                function (role) {

                    const roleContainer =
                        document.createElement(
                            "div"
                        );

                    roleContainer.classList.add(
                        "d-flex",
                        "justify-content-between",
                        "align-items-center",
                        "border",
                        "rounded",
                        "p-2",
                        "mb-2"
                    );


                    const roleName =
                        document.createElement(
                            "span"
                        );

                    roleName.textContent =
                        role.name;


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

                            removeRole(
                                userId,
                                role.id
                            );

                        }
                    );


                    roleContainer.appendChild(
                        roleName
                    );

                    roleContainer.appendChild(
                        removeButton
                    );


                    currentRoles.appendChild(
                        roleContainer
                    );

                }
            );


        } catch (error) {

            console.error(
                "Current roles loading error:",
                error
            );


            currentRoles.innerHTML = `
                <span class="text-danger">
                    Unable to load roles.
                </span>
            `;

        }

    }


    async function assignRole() {

        if (!selectedUserId) {

            return;

        }


        const roleId =
            roleSelect.value;


        if (!roleId) {

            showMessage(
                roleModalMessage,
                "Please select a role.",
                "warning"
            );

            return;

        }


        assignRoleButton.disabled =
            true;


        try {

            const response =
                await apiRequest(
                    "/access-control/users/roles/assign/",
                    {
                        method: "POST",

                        body: JSON.stringify(
                            {
                                user_id:
                                    selectedUserId,

                                role_id:
                                    Number(roleId)
                            }
                        )
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
                    "Unable to assign role."
                );

            }


            showMessage(
                roleModalMessage,
                result.message ||
                "Role assigned successfully.",
                "success"
            );


            roleSelect.value = "";


            await loadCurrentRoles(
                selectedUserId
            );


            await loadUsers();


        } catch (error) {

            console.error(
                "Role assignment error:",
                error
            );


            showMessage(
                roleModalMessage,
                error.message,
                "danger"
            );

        } finally {

            assignRoleButton.disabled =
                false;

        }

    }


    async function removeRole(
        userId,
        roleId
    ) {

        try {

            const response =
                await apiRequest(
                    "/access-control/users/roles/remove/",
                    {
                        method: "DELETE",

                        body: JSON.stringify(
                            {
                                user_id:
                                    userId,

                                role_id:
                                    roleId
                            }
                        )
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
                    "Unable to remove role."
                );

            }


            showMessage(
                roleModalMessage,
                result.message ||
                "Role removed successfully.",
                "success"
            );


            await loadCurrentRoles(
                userId
            );


            await loadUsers();


        } catch (error) {

            console.error(
                "Role removal error:",
                error
            );


            showMessage(
                roleModalMessage,
                error.message,
                "danger"
            );

        }

    }


    if (assignRoleButton) {

        assignRoleButton.addEventListener(
            "click",
            assignRole
        );

    }


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            if (
                !AuthManager.isAuthenticated()
            ) {

                return;

            }


            loadUsers();

        }
    );

})();