const AuditManager = {

    audits: [],

    editingAuditId: null,


    init: function () {

        if (!AuthManager.isAuthenticated()) {
            return;
        }

        this.bindEvents();

        this.loadPermissions();

        this.loadAudits();

    },


    bindEvents: function () {

        const createButton =
            document.getElementById(
                "create-audit-button"
            );

        const saveButton =
            document.getElementById(
                "save-audit-button"
            );


        if (createButton) {

            createButton.addEventListener(
                "click",
                () => {

                    this.openCreateModal();

                }
            );

        }


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                () => {

                    this.saveAudit();

                }
            );

        }

    },


    async loadPermissions() {

        const permissions =
            await PermissionManager.load();


        if (!permissions) {
            return;
        }


        const createButton =
            document.getElementById(
                "create-audit-button"
            );


        if (
            createButton &&
            !PermissionManager.has(
                "audit.create"
            )
        ) {

            createButton.classList.add(
                "d-none"
            );

        }

    },


    async loadAudits() {

        const tableBody =
            document.getElementById(
                "audit-table-body"
            );


        if (!tableBody) {
            return;
        }


        const response =
            await this.apiRequest(
                "/audit/audits/",
                {
                    method: "GET"
                }
            );


        if (!response) {
            return;
        }


        if (!response.ok) {

            const result =
                await response.json()
                    .catch(
                        () => ({})
                    );

            this.showMessage(
                result.message ||
                "Unable to load audits.",
                "danger"
            );

            return;

        }


        const result =
            await response.json();


        this.audits =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        this.renderAudits();

    },


    renderAudits: function () {

        const tableBody =
            document.getElementById(
                "audit-table-body"
            );


        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = "";


        if (!this.audits.length) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="text-center text-muted py-4">

                        No audits found.

                    </td>

                </tr>

            `;

            return;

        }


        this.audits.forEach(
            audit => {

                tableBody.appendChild(
                    this.createAuditRow(
                        audit
                    )
                );

            }
        );

    },


    createAuditRow: function (audit) {

        const row =
            document.createElement(
                "tr"
            );


        const titleCell =
            document.createElement(
                "td"
            );

        titleCell.textContent =
            audit.title || "-";


        const auditorCell =
            document.createElement(
                "td"
            );

        auditorCell.textContent =
            audit.assigned_auditor_email ||
            "Not assigned";


        const statusCell =
            document.createElement(
                "td"
            );

        statusCell.appendChild(
            this.createStatusBadge(
                audit.status
            )
        );


        const createdByCell =
            document.createElement(
                "td"
            );

        createdByCell.textContent =
            audit.created_by_email ||
            "-";


        const createdAtCell =
            document.createElement(
                "td"
            );

        createdAtCell.textContent =
            this.formatDate(
                audit.created_at
            );


        const actionCell =
            document.createElement(
                "td"
            );

        actionCell.classList.add(
            "text-end"
        );


        actionCell.appendChild(
            this.createActions(
                audit
            )
        );


        row.appendChild(
            titleCell
        );

        row.appendChild(
            auditorCell
        );

        row.appendChild(
            statusCell
        );

        row.appendChild(
            createdByCell
        );

        row.appendChild(
            createdAtCell
        );

        row.appendChild(
            actionCell
        );


        return row;

    },


    createStatusBadge: function (status) {

        const badge =
            document.createElement(
                "span"
            );


        badge.classList.add(
            "badge"
        );


        const statusMap = {

            draft: "bg-secondary",

            in_progress: "bg-primary",

            under_review: "bg-warning text-dark",

            approved: "bg-success",

            rejected: "bg-danger"

        };


        badge.classList.add(
            statusMap[status] ||
            "bg-secondary"
        );


        const labelMap = {

            draft: "Draft",

            in_progress: "In Progress",

            under_review: "Under Review",

            approved: "Approved",

            rejected: "Rejected"

        };


        badge.textContent =
            labelMap[status] ||
            status ||
            "-";


        return badge;

    },


    createActions: function (audit) {

        const container =
            document.createElement(
                "div"
            );


        container.classList.add(
            "d-flex",
            "justify-content-end",
            "gap-1",
            "flex-wrap"
        );


        if (
            PermissionManager.has(
                "audit.view"
            )
        ) {

            const viewButton =
                this.createActionButton(
                    "View",
                    "btn-outline-secondary",
                    "bi-eye",
                    () => {

                        this.viewAudit(
                            audit.id
                        );

                    }
                );


            container.appendChild(
                viewButton
            );

        }


        if (
            PermissionManager.has(
                "audit.update"
            ) &&
            audit.status === "draft"
        ) {

            const editButton =
                this.createActionButton(
                    "Edit",
                    "btn-outline-primary",
                    "bi-pencil",
                    () => {

                        this.openEditModal(
                            audit
                        );

                    }
                );


            const startButton =
                this.createActionButton(
                    "Start",
                    "btn-outline-primary",
                    "bi-play",
                    () => {

                        this.startAudit(
                            audit.id
                        );

                    }
                );


            container.appendChild(
                editButton
            );

            container.appendChild(
                startButton
            );

        }


        if (
            PermissionManager.has(
                "audit.update"
            ) &&
            audit.status === "in_progress"
        ) {

            const submitButton =
                this.createActionButton(
                    "Submit",
                    "btn-outline-warning",
                    "bi-send",
                    () => {

                        this.submitForReview(
                            audit.id
                        );

                    }
                );


            container.appendChild(
                submitButton
            );

        }


        if (
            PermissionManager.has(
                "audit.review"
            ) &&
            audit.status === "under_review"
        ) {

            const reviewButton =
                this.createActionButton(
                    "Review",
                    "btn-outline-success",
                    "bi-check2-circle",
                    () => {

                        this.reviewAudit(
                            audit.id
                        );

                    }
                );


            const rejectButton =
                this.createActionButton(
                    "Reject",
                    "btn-outline-danger",
                    "bi-x-circle",
                    () => {

                        this.rejectAudit(
                            audit.id
                        );

                    }
                );


            container.appendChild(
                reviewButton
            );

            container.appendChild(
                rejectButton
            );

        }


        if (
            PermissionManager.has(
                "audit.approve"
            ) &&
            audit.status === "under_review"
        ) {

            const approveButton =
                this.createActionButton(
                    "Approve",
                    "btn-outline-success",
                    "bi-check-circle",
                    () => {

                        this.approveAudit(
                            audit.id
                        );

                    }
                );


            container.appendChild(
                approveButton
            );

        }


        return container;

    },


    createActionButton: function (
        text,
        buttonClass,
        iconClass,
        callback
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.classList.add(
            "btn",
            "btn-sm",
            buttonClass
        );


        const icon =
            document.createElement(
                "i"
            );


        icon.classList.add(
            "bi",
            iconClass
        );


        button.appendChild(
            icon
        );


        button.appendChild(
            document.createTextNode(
                ` ${text}`
            )
        );


        button.addEventListener(
            "click",
            callback
        );


        return button;

    },


    async openCreateModal() {

        this.editingAuditId =
            null;


        document.getElementById(
            "audit-modal-title"
        ).textContent =
            "Create Audit";


        document.getElementById(
            "save-audit-button"
        ).textContent =
            "Create Audit";


        document.getElementById(
            "audit-title"
        ).value =
            "";


        document.getElementById(
            "audit-description"
        ).value =
            "";


        this.clearModalMessage();


        await this.loadEligibleAuditors();


        this.showAuditModal();

    },


    async openEditModal(audit) {

        this.editingAuditId =
            audit.id;


        document.getElementById(
            "audit-modal-title"
        ).textContent =
            "Update Audit";


        document.getElementById(
            "save-audit-button"
        ).textContent =
            "Update Audit";


        document.getElementById(
            "audit-title"
        ).value =
            audit.title || "";


        document.getElementById(
            "audit-description"
        ).value =
            audit.description || "";


        this.clearModalMessage();


        await this.loadEligibleAuditors(
            audit.assigned_auditor_email
        );


        this.showAuditModal();

    },


    async loadEligibleAuditors(
        selectedEmail = null
    ) {

        const select =
            document.getElementById(
                "audit-assigned-auditor"
            );


        if (!select) {
            return;
        }


        select.innerHTML = `

            <option value="">
                Loading eligible users...
            </option>

        `;


        const response =
            await this.apiRequest(
                "/audit/auditors/",
                {
                    method: "GET"
                }
            );


        if (!response) {
            return;
        }


        if (!response.ok) {

            const result =
                await response.json()
                    .catch(
                        () => ({})
                    );


            select.innerHTML = `

                <option value="">
                    ${
                        result.message ||
                        "Unable to load users"
                    }
                </option>

            `;

            return;

        }


        const result =
            await response.json();


        const users =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        select.innerHTML = `

            <option value="">
                Select Auditor
            </option>

        `;


        users.forEach(
            user => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    user.account_id;


                option.textContent =
                    user.full_name
                        ? `${user.full_name} (${user.email})`
                        : user.email;


                if (
                    selectedEmail &&
                    user.email === selectedEmail
                ) {

                    option.selected =
                        true;

                }


                select.appendChild(
                    option
                );

            }
        );


        if (!users.length) {

            select.innerHTML = `

                <option value="">
                    No eligible users found
                </option>

            `;

        }

    },


    async saveAudit() {

        const titleInput =
            document.getElementById(
                "audit-title"
            );


        const descriptionInput =
            document.getElementById(
                "audit-description"
            );


        const auditorSelect =
            document.getElementById(
                "audit-assigned-auditor"
            );


        const title =
            titleInput.value.trim();


        const description =
            descriptionInput.value.trim();


        const assignedAuditor =
            auditorSelect.value;


        if (!title) {

            this.showModalMessage(
                "Audit title is required.",
                "danger"
            );

            return;

        }


        const payload = {

            title: title,

            description: description,

            assigned_auditor:
                assignedAuditor || null

        };


        let url =
            "/audit/audits/";


        let method =
            "POST";


        if (
            this.editingAuditId !== null
        ) {

            url =
                `/audit/audits/${this.editingAuditId}/`;

            method =
                "PUT";

        }


        const saveButton =
            document.getElementById(
                "save-audit-button"
            );


        if (saveButton) {

            saveButton.disabled =
                true;

        }


        try {

            const response =
                await this.apiRequest(
                    url,
                    {
                        method: method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            if (!response) {
                return;
            }


            const result =
                await response.json()
                    .catch(
                        () => ({})
                    );


            if (!response.ok) {

                this.showModalMessage(
                    result.message ||
                    "Unable to save audit.",
                    "danger"
                );

                return;

            }


            this.hideAuditModal();


            this.showMessage(
                result.message ||
                "Audit saved successfully.",
                "success"
            );


            await this.loadAudits();

        } finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

            }

        }

    },


    async startAudit(auditId) {

        await this.performAction(
            `/audit/audits/${auditId}/start/`,
            "Audit started successfully."
        );

    },


    async submitForReview(auditId) {

        await this.performAction(
            `/audit/audits/${auditId}/submit-review/`,
            "Audit submitted for review."
        );

    },


    async reviewAudit(auditId) {

        await this.performAction(
            `/audit/audits/${auditId}/review/`,
            "Audit reviewed successfully."
        );

    },


    async rejectAudit(auditId) {

        await this.performAction(
            `/audit/audits/${auditId}/reject/`,
            "Audit rejected successfully."
        );

    },


    async approveAudit(auditId) {

        await this.performAction(
            `/audit/audits/${auditId}/approve/`,
            "Audit approved successfully."
        );

    },


    async performAction(
        url,
        successMessage
    ) {

        const response =
            await this.apiRequest(
                url,
                {
                    method: "POST"
                }
            );


        if (!response) {
            return;
        }


        const result =
            await response.json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            this.showMessage(
                result.message ||
                "Unable to perform action.",
                "danger"
            );

            return;

        }


        this.showMessage(
            result.message ||
            successMessage,
            "success"
        );


        await this.loadAudits();

    },


    async viewAudit(auditId) {

        const response =
            await this.apiRequest(
                `/audit/audits/${auditId}/`,
                {
                    method: "GET"
                }
            );


        if (!response) {
            return;
        }


        const result =
            await response.json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            this.showMessage(
                result.message ||
                "Unable to load audit.",
                "danger"
            );

            return;

        }


        const audit =
            result.data;


        const content =
            document.getElementById(
                "audit-detail-content"
            );


        if (!content) {
            return;
        }


        content.innerHTML = `

            <div class="row g-3">

                <div class="col-md-6">

                    <strong>Title</strong>

                    <div>
                        ${this.escapeHtml(
                            audit.title
                        )}
                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Status</strong>

                    <div
                        class="mt-1"
                        id="audit-detail-status">
                    </div>

                </div>


                <div class="col-12">

                    <strong>Description</strong>

                    <div class="mt-1">

                        ${
                            this.escapeHtml(
                                audit.description ||
                                "-"
                            )
                        }

                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Created By</strong>

                    <div>

                        ${
                            this.escapeHtml(
                                audit.created_by_email ||
                                "-"
                            )
                        }

                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Assigned Auditor</strong>

                    <div>

                        ${
                            this.escapeHtml(
                                audit.assigned_auditor_email ||
                                "Not assigned"
                            )
                        }

                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Reviewed By</strong>

                    <div>

                        ${
                            this.escapeHtml(
                                audit.reviewed_by_email ||
                                "-"
                            )
                        }

                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Approved By</strong>

                    <div>

                        ${
                            this.escapeHtml(
                                audit.approved_by_email ||
                                "-"
                            )
                        }

                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Created At</strong>

                    <div>

                        ${
                            this.formatDate(
                                audit.created_at
                            )
                        }

                    </div>

                </div>


                <div class="col-md-6">

                    <strong>Updated At</strong>

                    <div>

                        ${
                            this.formatDate(
                                audit.updated_at
                            )
                        }

                    </div>

                </div>

            </div>

        `;


        const statusContainer =
            document.getElementById(
                "audit-detail-status"
            );


        if (statusContainer) {

            statusContainer.appendChild(
                this.createStatusBadge(
                    audit.status
                )
            );

        }


        const modalElement =
            document.getElementById(
                "auditDetailModal"
            );


        if (!modalElement) {
            return;
        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    },


    showAuditModal: function () {

        const modalElement =
            document.getElementById(
                "auditModal"
            );


        if (!modalElement) {
            return;
        }


        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    },


    hideAuditModal: function () {

        const modalElement =
            document.getElementById(
                "auditModal"
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

    },


    showMessage: function (
        message,
        type
    ) {

        const element =
            document.getElementById(
                "audit-message"
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
            () => {

                element.classList.add(
                    "d-none"
                );

            },
            4000
        );

    },


    showModalMessage: function (
        message,
        type
    ) {

        const element =
            document.getElementById(
                "audit-modal-message"
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

    },


    clearModalMessage: function () {

        const element =
            document.getElementById(
                "audit-modal-message"
            );


        if (!element) {
            return;
        }


        element.className =
            "alert d-none";


        element.textContent =
            "";

    },


    formatDate: function (
        value
    ) {

        if (!value) {
            return "-";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;

        }


        return date.toLocaleString();

    },


    escapeHtml: function (
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;

    },


    async apiRequest(
        url,
        options = {}
    ) {

        const accessToken =
            localStorage.getItem(
                "access_token"
            );


        if (!accessToken) {

            window.location.replace(
                "/login/"
            );

            return null;

        }


        const headers = {

            ...(options.headers || {}),

            "Authorization":
                `Bearer ${accessToken}`

        };


        const response =
            await fetch(
                url,
                {
                    ...options,
                    headers: headers
                }
            );


        if (
            response.status === 401
        ) {

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

};


document.addEventListener(
    "DOMContentLoaded",
    function () {

        AuditManager.init();

    }
);