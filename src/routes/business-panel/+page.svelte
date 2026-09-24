<script lang="ts">
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import { goto } from "$app/navigation";
    import { accessToken } from "$lib/stores/authStore";
    import { profileStore } from "$lib/stores/profileStore";
    import { apiFetch } from "$lib/api";
    import {
        Pencil,
        Plus,
        Trash2,
        Users,
        Crown,
        UserMinus,
        ShieldCheck,
        UserPlus,
        Mail,
    } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    interface Partner {
        id_partner: string;
        name: string;
        logo: string;
        direction: string[];
        active: boolean;
    }

    interface Benefit {
        id_benefit: string;
        id_partner: string;
        title: string;
        image: string;
        coupons: number;
        max_coupons: number;
        status?: "ACTIVE" | "INACTIVE" | "PENDING";
    }

    interface Voucher {
        status: "PENDING" | "DELIVERED" | "EXPIRED";
    }

    interface LocationItem {
        id_location: number;
        id_partner: string;
        direction: string;
    }

    interface UsersDTO {
        id_user: string;
        name: string;
        dni: string;
        lastname: string;
        email?: string | null;
        role?: string | null;
    }

    let partners: Partner[] = $state([]);
    let selectedPartnerId = $state<string>("");
    let partner: Partner | undefined = $derived(
        partners.find((p) => p.id_partner === selectedPartnerId),
    );

    $effect(() => {
        const profile = profileStore.getProfile();
        if (profile && profile.role !== "PARTNER_ADMIN") goto("/");
    });

    let benefits: Benefit[] = $state([]);
    let redeemed = $state(0);
    let loading = $state(true);
    let error = $state("");

    let locations: LocationItem[] = $state([]);
    let locationsError = $state("");

    let editingName = $state(false);
    let nameInput = $state("");
    let savingName = $state(false);
    let nameError = $state("");

    let editingLogo = $state(false);
    let logoInput = $state("");
    let savingLogo = $state(false);
    let logoError = $state("");

    let locationInput = $state("");
    let addingLocation = $state(false);
    let addingLocationError = $state("");
    let removingLocationId: number | null = $state(null);

    let employees: UsersDTO[] = $state([]);
    let employeesLoading = $state(false);
    let employeesError = $state("");
    let employeeNameInput = $state("");
    let employeeLastNameInput = $state("");
    let employeeDniInput = $state("");
    let addingEmployee = $state(false);
    let addingEmployeeError = $state("");
    let removingEmployeeId: string | null = $state(null);
    let promotingEmployeeId: string | null = $state(null);

    const used = $derived(
        benefits.reduce((total, benefit) => total + benefit.coupons, 0),
    );
    const active = $derived(
        benefits.filter((benefit) => benefit.status === "ACTIVE").length,
    );

    function authHeaders(): Record<string, string> {
        return {};
    }

    async function parseError(response: Response) {
        try {
            const data = await response.json();
            if (data?.message) {
                return Array.isArray(data.message)
                    ? data.message.join(", ")
                    : String(data.message);
            }
        } catch {
            /* sin cuerpo JSON */
        }
        return "Ocurrió un error.";
    }

    async function loadPartnerData(p: Partner) {
        selectedPartnerId = p.id_partner;
        benefits = [];
        locations = [];
        employees = [];
        redeemed = 0;

        try {
            const benefitsResponse = await apiFetch(
                `/api/benefits/partner?id_partner=${encodeURIComponent(p.id_partner)}`,
                { credentials: "include" },
            );
            if (benefitsResponse.ok) {
                benefits = (await benefitsResponse.json()).filter(
                    (b: Benefit) => b.id_partner === p.id_partner,
                );
            }

            const vouchers = await Promise.all(
                benefits.map(async (b): Promise<Voucher[]> => {
                    const response = await fetch(
                        `/api/vouchers/bybenefit?id_benefit=${b.id_benefit}`,
                    );
                    return response.ok ? await response.json() : [];
                }),
            );
            redeemed = vouchers
                .flat()
                .filter((v) => v.status === "DELIVERED").length;

            await Promise.all([loadLocations(), loadEmployees()]);
        } catch {
            // silent — benefits/locations will show empty states
        }
    }

    async function loadPanel() {
        const token = accessToken.getToken();
        if (!token) {
            error = "Tu sesión expiró. Volvé a iniciar sesión.";
            loading = false;
            return;
        }

        try {
            const response = await apiFetch("/api/partners-admins/me/all", {
                credentials: "include",
            });
            if (response.status === 401 || response.status === 403) {
                error = "No tenés permiso para ver el panel de negocio.";
                return;
            }
            if (!response.ok)
                throw new Error("No se pudieron obtener los negocios.");
            partners = await response.json();
            if (partners.length === 0) {
                error = "No tenés negocios asociados.";
                return;
            }
            if (
                !selectedPartnerId ||
                !partners.find((p) => p.id_partner === selectedPartnerId)
            ) {
                selectedPartnerId = partners[0].id_partner;
            }
            await loadPartnerData(partner!);
        } catch (cause) {
            error =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo cargar el panel.";
        } finally {
            loading = false;
        }
    }

    async function loadLocations() {
        if (!partner?.id_partner) return;
        const token = accessToken.getToken();
        if (!token) return;
        try {
            const response = await apiFetch(
                `/api/partners/locations?id_partner=${encodeURIComponent(partner.id_partner)}`,
                { credentials: "include" },
            );
            if (!response.ok) {
                locationsError = "No se pudieron cargar las ubicaciones.";
                toast.error(locationsError);
                locations = [];
                return;
            }
            locations = await response.json();
            locationsError = "";
        } catch {
            locationsError = "No se pudieron cargar las ubicaciones.";
                toast.error(locationsError);
        }
    }

    async function loadEmployees() {
        if (!partner?.id_partner) return;
        const token = accessToken.getToken();
        if (!token) return;
        employeesLoading = true;
        employeesError = "";
        try {
            const response = await apiFetch(
                `/api/partners/employees?id_partner=${encodeURIComponent(partner.id_partner)}`,
                { credentials: "include" },
            );
            if (!response.ok) {
                employeesError = await parseError(response);
                if (!employeesError || employeesError === "Ocurrió un error.") {
                    employeesError = "No se pudieron cargar los empleados.";
                }
                employees = [];
                return;
            }
            const data = await response.json();
            employees = Array.isArray(data) ? data : (data?.employees ?? []);
            employeesError = "";
        } catch {
            employeesError = "No se pudieron cargar los empleados.";
            employees = [];
        } finally {
            employeesLoading = false;
        }
    }

    async function addEmployee() {
        if (!partner || addingEmployee) return;
        const name = employeeNameInput.trim();
        const lastname = employeeLastNameInput.trim();
        const dni = employeeDniInput.trim();
        if (!name) {
            addingEmployeeError = "Ingresá el nombre.";
            return;
        }
        if (!lastname) {
            addingEmployeeError = "Ingresá el apellido.";
            return;
        }
        if (!dni) {
            addingEmployeeError = "Ingresá el DNI.";
            return;
        }
        if (!accessToken.getToken()) {
            addingEmployeeError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        addingEmployee = true;
        addingEmployeeError = "";
        try {
            const response = await apiFetch(
                `/api/partners/employees?id_partner=${encodeURIComponent(partner.id_partner)}`,
                {
                    method: "POST",
                    headers: {
                        ...authHeaders(),
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name,
                        lastname,
                        dni,
                    }),
                },
            );
            if (!response.ok) {
                addingEmployeeError = await parseError(response);
                toast.error(addingEmployeeError);
                return;
            }
            const created = await response.json().catch(() => null);
            if (created && created.id_user) {
                employees = [...employees, created];
                toast.success("Empleado agregado correctamente");
            } else {
                await loadEmployees();
            }
            employeeNameInput = "";
            employeeLastNameInput = "";
            employeeDniInput = "";
        } catch (cause) {
            addingEmployeeError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo agregar el empleado.";
        } finally {
            addingEmployee = false;
        }
    }

    async function removeEmployee(employee: UsersDTO) {
        if (!partner || removingEmployeeId) return;
        if (!accessToken.getToken()) {
            employeesError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        removingEmployeeId = employee.id_user;
        employeesError = "";
        try {
            const response = await apiFetch(
                `/api/partners/employees?id_partner=${encodeURIComponent(partner.id_partner)}&dni=${encodeURIComponent(employee.dni)}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                    credentials: "include",
                },
            );
            if (!response.ok) {
                employeesError = await parseError(response);
                toast.error(employeesError);
                return;
            }
            employees = employees.filter((e) => e.id_user !== employee.id_user);
            toast.success("Empleado eliminado correctamente");
        } catch (cause) {
            employeesError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo quitar el empleado.";
        } finally {
            removingEmployeeId = null;
        }
    }

    async function promoteEmployee(employee: UsersDTO) {
        if (!partner || promotingEmployeeId) return;
        if (!accessToken.getToken()) {
            employeesError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        promotingEmployeeId = employee.id_user;
        employeesError = "";
        try {
            const response = await apiFetch("/api/accounts/role", {
                method: "PATCH",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_account: employee.id_user,
                    id_partner: partner.id_partner,
                    newRole: "PARTNER_ADMIN",
                }),
            });
            if (!response.ok) {
                employeesError = await parseError(response);
                toast.error(employeesError);
                return;
            }
            // Marcar como promovido localmente o recargar
            employees = employees.map((e) =>
                e.id_user === employee.id_user
                    ? { ...e, role: "PARTNER_ADMIN" }
                    : e,
            );
            toast.success("Empleado promovido a administrador");
        } catch (cause) {
            employeesError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo promover el empleado.";
        } finally {
            promotingEmployeeId = null;
        }
    }

    function selectPartner(p: Partner) {
        if (p.id_partner === selectedPartnerId) return;
        editingName = false;
        editingLogo = false;
        loadPartnerData(p);
    }

    function startEditName() {
        if (!partner || editingLogo) return;
        nameInput = partner.name;
        nameError = "";
        editingName = true;
    }

    function cancelEditName() {
        editingName = false;
        nameInput = "";
        nameError = "";
    }

    async function updateName() {
        if (!partner || savingName) return;
        const new_name = nameInput.trim();
        if (!new_name) {
            nameError = "Ingresá un nombre.";
            return;
        }
        if (new_name.toLowerCase() === partner.name.toLowerCase()) {
            editingName = false;
            return;
        }
        if (!accessToken.getToken()) {
            nameError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        savingName = true;
        nameError = "";
        try {
            const response = await apiFetch("/api/partners/name", {
                method: "PATCH",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_partner: partner.id_partner,
                    new_name,
                }),
            });
            if (!response.ok) {
                nameError = await parseError(response);
                toast.error(nameError);
                return;
            }
            const data = await response.json();
            const updatedName = data?.name ?? new_name.toLowerCase();
            partners = partners.map((p) =>
                p.id_partner === partner!.id_partner
                    ? { ...p, name: updatedName }
                    : p,
            );
            editingName = false;
            toast.success("Nombre actualizado correctamente");
        } catch (cause) {
            nameError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo actualizar el nombre.";
        } finally {
            savingName = false;
        }
    }

    function startEditLogo() {
        if (!partner || editingName) return;
        logoInput = partner.logo;
        logoError = "";
        editingLogo = true;
    }

    function cancelEditLogo() {
        editingLogo = false;
        logoInput = "";
        logoError = "";
    }

    async function updateLogo() {
        if (!partner || savingLogo) return;
        const new_logo = logoInput.trim();
        if (!new_logo) {
            logoError = "Ingresá la URL de la imagen.";
            return;
        }
        if (new_logo === partner.logo) {
            editingLogo = false;
            return;
        }
        if (!accessToken.getToken()) {
            logoError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        savingLogo = true;
        logoError = "";
        try {
            const response = await apiFetch("/api/partners/logo", {
                method: "PATCH",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_partner: partner.id_partner,
                    new_logo,
                }),
            });
            if (!response.ok) {
                logoError = await parseError(response);
                toast.error(logoError);
                return;
            }
            const data = await response.json();
            const updatedLogo = data?.logo ?? new_logo;
            partners = partners.map((p) =>
                p.id_partner === partner!.id_partner
                    ? { ...p, logo: updatedLogo }
                    : p,
            );
            editingLogo = false;
            toast.success("Logo actualizado correctamente");
        } catch (cause) {
            logoError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo actualizar la imagen.";
        } finally {
            savingLogo = false;
        }
    }

    async function addLocation() {
        if (!partner || addingLocation) return;
        const direction = locationInput.trim();
        if (!direction) {
            addingLocationError = "Ingresá una dirección.";
            return;
        }
        if (!accessToken.getToken()) {
            addingLocationError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        addingLocation = true;
        addingLocationError = "";
        try {
            const response = await apiFetch("/api/partners/locations", {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_partner: partner.id_partner,
                    direction,
                }),
            });
            if (!response.ok) {
                addingLocationError = await parseError(response);
                toast.error(addingLocationError);
                return;
            }
            const created = await response.json();
            locations = [...locations, created];
            locationInput = "";
            toast.success("Ubicación agregada correctamente");
        } catch (cause) {
            addingLocationError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo agregar la ubicación.";
        } finally {
            addingLocation = false;
        }
    }

    async function removeLocation(id: number) {
        if (!partner || removingLocationId) return;
        if (!accessToken.getToken()) {
            locationsError = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }
        removingLocationId = id;
        locationsError = "";
        try {
            const response = await apiFetch(
                `/api/partners/locations?id_location=${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                    credentials: "include",
                },
            );
            if (!response.ok) {
                locationsError = await parseError(response);
                toast.error(locationsError);
                return;
            }
            locations = locations.filter(
                (location) => location.id_location !== id,
            );
            toast.success("Ubicación eliminada correctamente");
        } catch (cause) {
            locationsError =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo quitar la ubicación.";
        } finally {
            removingLocationId = null;
        }
    }

    onMount(loadPanel);
</script>

<svelte:head><title>Panel de negocio | CeCIT</title></svelte:head>

<section class="business-panel">
    <div class="inner">
        <div class="intro-row">
            <div>
                <h1>Panel de Negocio</h1>
                <p>
                    Configura los detalles de tu negocio, administra tus
                    beneficios y visualiza tu alcance.
                </p>
            </div>
            <div class="metrics" aria-label="Resumen de beneficios">
                <div>
                    <strong>{used}</strong><span
                        >UTILIZARON<br />BENEFICIOS</span
                    >
                </div>
                <div>
                    <strong>{redeemed}</strong><span
                        >CANJEARON<br />BENEFICIOS</span
                    >
                </div>
                <div>
                    <strong>{active}</strong><span>ACTIVOS<br />BENEFICIOS</span
                    >
                </div>
            </div>
        </div>
        {#if loading}
            <p class="state">Cargando información del negocio...</p>
        {:else if partners.length > 0}
            {#if partners.length > 1}
                <div
                    class="partner-selector"
                    role="tablist"
                    aria-label="Seleccionar negocio"
                >
                    {#each partners as p (p.id_partner)}
                        <button
                            type="button"
                            role="tab"
                            aria-selected={p.id_partner === selectedPartnerId}
                            class="partner-tab"
                            class:active={p.id_partner === selectedPartnerId}
                            onclick={() => selectPartner(p)}
                        >
                            <img
                                class="partner-tab-logo"
                                src={p.logo}
                                alt=""
                                loading="lazy"
                            />
                            <span>{p.name}</span>
                        </button>
                    {/each}
                </div>
            {/if}

            {#if partner}
                <section class="business-card">
                    <div class="logo-col">
                        <img
                            class="logo"
                            src={partner.logo}
                            alt={`Logo de ${partner.name}`}
                        />

                        {#if editingLogo}
                            <div
                                class="edit-field expand-panel"
                                transition:slide={{ duration: 200 }}
                            >
                                <input
                                    type="text"
                                    placeholder="URL de la imagen"
                                    bind:value={logoInput}
                                    onkeydown={(e) =>
                                        e.key === "Enter" && updateLogo()}
                                />
                                <div class="edit-actions">
                                    <button
                                        class="save-btn"
                                        type="button"
                                        onclick={updateLogo}
                                        disabled={savingLogo}
                                        >{savingLogo
                                            ? "Guardando…"
                                            : "Guardar"}</button
                                    >
                                    <button
                                        class="cancel-btn"
                                        type="button"
                                        onclick={cancelEditLogo}
                                        >Cancelar</button
                                    >
                                </div>
                            </div>
                        {:else}
                            <button
                                class="edit-btn"
                                type="button"
                                onclick={startEditLogo}
                            >
                                <Pencil size={14} />
                                Cambiar imagen
                            </button>
                        {/if}
                    </div>

                    <div class="business-details">
                        <div class="name-row">
                            <h2>{partner.name}</h2>
                            {#if !editingName}
                                <button
                                    class="edit-btn small"
                                    type="button"
                                    onclick={startEditName}
                                >
                                    <Pencil size={12} />
                                    Modificar
                                </button>
                            {/if}
                        </div>

                        {#if editingName}
                            <div
                                class="edit-field expand-panel"
                                transition:slide={{ duration: 200 }}
                            >
                                <input
                                    type="text"
                                    placeholder="Nombre del negocio"
                                    bind:value={nameInput}
                                    onkeydown={(e) =>
                                        e.key === "Enter" && updateName()}
                                />
                                <div class="edit-actions">
                                    <button
                                        class="save-btn"
                                        type="button"
                                        onclick={updateName}
                                        disabled={savingName}
                                        >{savingName
                                            ? "Guardando…"
                                            : "Guardar"}</button
                                    >
                                    <button
                                        class="cancel-btn"
                                        type="button"
                                        onclick={cancelEditName}
                                        >Cancelar</button
                                    >
                                </div>
                            </div>
                        {/if}

                        <details>
                            <summary>Contacto</summary>
                            <p>
                                La API actual no proporciona datos de contacto.
                            </p>
                        </details>
                        <details>
                            <summary>Horarios</summary>
                            <p>La API actual no proporciona horarios.</p>
                        </details>
                        <details>
                            <summary>Galería</summary>
                            <p>La API actual no proporciona una galería.</p>
                        </details>
                    </div>

                    <div class="location">
                        <h3>Ubicaciones</h3>

                        <ul class="locs-list">
                            {#each locations as location}
                                <li class="loc-item">
                                    <span>{location.direction}</span>
                                    <button
                                        class="remove-btn"
                                        type="button"
                                        aria-label={`Quitar ${location.direction}`}
                                        onclick={() =>
                                            removeLocation(
                                                location.id_location,
                                            )}
                                        disabled={removingLocationId !== null}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            {:else}
                                <li class="loc-empty">
                                    Sin ubicaciones registradas.
                                </li>
                            {/each}
                        </ul>

                        <div class="add-location">
                            <input
                                type="text"
                                placeholder="Nueva dirección"
                                bind:value={locationInput}
                                onkeydown={(e) =>
                                    e.key === "Enter" && addLocation()}
                            />
                            <button
                                class="add-btn"
                                type="button"
                                onclick={addLocation}
                                disabled={addingLocation}
                            >
                                {#if addingLocation}
                                    <span class="spinner"></span>
                                {:else}
                                    <Plus size={18} />
                                {/if}
                                Agregar
                            </button>
                        </div>
                    </div>
                </section>

                <section class="employees-section">
                    <div class="employees-header">
                        <h2><Users size={20} /> Empleados</h2>
                        <button
                            class="refresh-btn"
                            type="button"
                            onclick={loadEmployees}
                            disabled={employeesLoading}
                            aria-label="Recargar empleados"
                        >
                            {#if employeesLoading}<span class="spinner small"
                                ></span>{:else}Recargar{/if}
                        </button>
                    </div>

                    {#if employeesLoading}
                        <p class="state small">Cargando empleados...</p>
                    {:else}
                        <ul class="employees-list">
                            {#each employees as employee (employee.id_user)}
                                <li class="employee-item">
                                    <div class="employee-info">
                                        <span class="employee-email"
                                            >{employee.name}
                                            {employee.lastname}</span
                                        >
                                        <span class="employee-name"
                                            >DNI: {employee.dni}</span
                                        >
                                        <span class="employee-name"
                                            >ID de Usuario: {employee.id_user}</span
                                        >
                                        {#if employee.email}
                                            <span class="employee-email-detail"
                                                ><Mail size={12} /> {employee.email}</span
                                            >
                                        {:else}
                                            <span class="employee-no-account"
                                                >Sin cuenta — El usuario no tiene cuenta</span
                                            >
                                        {/if}
                                        {#if employee.role === "PARTNER_ADMIN"}
                                            <span class="employee-role admin"
                                                ><Crown size={12} /> PARTNER_ADMIN</span
                                            >
                                        {:else if employee.role}
                                            <span class="employee-role"
                                                >{employee.role}</span
                                            >
                                        {/if}
                                    </div>
                                    <div class="employee-actions">
                                        {#if employee.role === "PARTNER_ADMIN"}
                                            <span class="admin-badge"
                                                ><Crown size={14} /> Admin</span
                                            >
                                        {:else if employee.email}
                                            <button
                                                class="promote-btn"
                                                type="button"
                                                onclick={() =>
                                                    promoteEmployee(employee)}
                                                disabled={promotingEmployeeId !==
                                                    null ||
                                                    removingEmployeeId !== null}
                                                title="Hacer PARTNER_ADMIN"
                                            >
                                                {#if promotingEmployeeId === employee.id_user}
                                                    <span
                                                        class="spinner small dark"
                                                    ></span>
                                                {:else}
                                                    <ShieldCheck size={16} />
                                                {/if}
                                                Hacer admin
                                            </button>
                                        {/if}
                                        <button
                                            class="remove-btn"
                                            type="button"
                                            aria-label={`Quitar ${employee.name} ${employee.lastname}`}
                                            onclick={() =>
                                                removeEmployee(employee)}
                                            disabled={removingEmployeeId !==
                                                null ||
                                                promotingEmployeeId !== null}
                                        >
                                            {#if removingEmployeeId === employee.id_user}
                                                <span class="spinner small dark"
                                                ></span>
                                            {:else}
                                                <UserMinus size={16} />
                                            {/if}
                                        </button>
                                    </div>
                                </li>
                            {:else}
                                <li class="loc-empty">
                                    Sin empleados registrados.
                                </li>
                            {/each}
                        </ul>
                    {/if}

                    <div class="add-employee">
                        <input
                            type="text"
                            placeholder="Nombre"
                            bind:value={employeeNameInput}
                            onkeydown={(e) =>
                                e.key === "Enter" && addEmployee()}
                        />
                        <input
                            type="text"
                            placeholder="Apellido"
                            bind:value={employeeLastNameInput}
                            onkeydown={(e) =>
                                e.key === "Enter" && addEmployee()}
                        />
                        <input
                            type="text"
                            placeholder="DNI"
                            bind:value={employeeDniInput}
                            onkeydown={(e) =>
                                e.key === "Enter" && addEmployee()}
                        />
                        <button
                            class="add-btn"
                            type="button"
                            onclick={addEmployee}
                            disabled={addingEmployee}
                        >
                            {#if addingEmployee}
                                <span class="spinner"></span>
                            {:else}
                                <UserPlus size={18} />
                            {/if}
                            Agregar
                        </button>
                    </div>
                </section>

                <section class="coupons">
                    <h2>Tus Cupones</h2>
                    <div class="coupon-grid">
                        {#each benefits as benefit}
                            <article class="coupon">
                                <img src={benefit.image} alt={benefit.title} />
                                <h3>{benefit.title}</h3>
                                <p>
                                    <b>{benefit.coupons}</b> /
                                    <b>{benefit.max_coupons}</b> CANJEADOS
                                </p>
                            </article>
                        {:else}
                            <p class="empty">
                                Todavía no tenés beneficios cargados.
                            </p>
                        {/each}
                    </div>
                </section>
            {/if}
        {/if}
    </div>
</section>

<style>
    .business-panel {
        min-height: 70vh;
        padding: 50px 24px 88px;
        background: #fff;
        color: #111;
    }
    .inner {
        width: min(100%, 1160px);
        margin: 0 auto;
    }
    .intro-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 36px;
        margin-bottom: 28px;
    }
    h1 {
        margin: 0;
        font-size: 30px;
    }
    .intro-row > div > p {
        max-width: 390px;
        margin: 6px 0 0;
        font-size: 17px;
        line-height: 1.3;
    }
    .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        min-width: 505px;
        border: 1px solid #777;
        border-radius: 9px;
        padding: 14px 0;
    }
    .metrics div {
        display: grid;
        place-items: center;
        gap: 5px;
        border-right: 1px solid #aaa;
    }
    .metrics div:last-child {
        border: 0;
    }
    .metrics strong {
        font-size: 30px;
        font-weight: 500;
    }
    .metrics span {
        text-align: center;
        font-size: 12px;
        line-height: 1.25;
    }
    .business-card,
    .coupons,
    .employees-section {
        border: 1px solid #969696;
        border-radius: 8px;
        padding: 26px 28px;
    }
    .business-card {
        display: grid;
        grid-template-columns: 170px minmax(220px, 1fr) minmax(240px, 1fr);
        gap: 26px;
        align-items: start;
    }

    .logo-col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
    .logo {
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 6px;
        object-fit: cover;
        background: #eee;
    }

    .business-details h2,
    .coupons h2 {
        margin: 4px 0 12px;
        font-size: 23px;
        font-weight: 500;
    }
    .name-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    details {
        border-top: 1px solid #9a9a9a;
        padding: 9px 0;
    }
    summary {
        cursor: pointer;
        font-size: 17px;
        display: flex;
        align-items: center;
        gap: 8px;
        list-style: none;
        transition: color 0.15s ease;
    }
    summary::-webkit-details-marker {
        display: none;
    }
    summary::before {
        content: "›";
        display: inline-block;
        font-size: 20px;
        line-height: 1;
        color: #19194f;
        transition: transform 0.2s ease;
    }
    details[open] > summary::before {
        transform: rotate(90deg);
    }
    summary:hover {
        color: #19194f;
    }
    details p {
        margin: 8px 0 0;
        color: #555;
        font-size: 14px;
    }
    /* Animación de despliegue del panel de información */
    details[open] > :not(summary) {
        animation: info-expand 0.22s ease;
        transform-origin: top center;
    }

    @keyframes info-expand {
        from {
            opacity: 0;
            transform: translateY(-6px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .edit-field.expand-panel {
        animation: expand-in 0.2s ease;
        transform-origin: top center;
    }

    @keyframes expand-in {
        from {
            opacity: 0;
            transform: translateY(-6px) scaleY(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scaleY(1);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        details[open] > :not(summary),
        .edit-field.expand-panel {
            animation: none;
        }
        summary::before {
            transition: none;
        }
    }

    .location h3 {
        margin: 4px 0 9px;
        font-size: 17px;
        font-weight: 500;
    }
    .locs-list {
        list-style: none;
        margin: 0 0 12px;
        padding: 0;
        display: grid;
        gap: 8px;
    }
    .loc-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 9px 11px;
        border: 1px solid #888;
        border-radius: 5px;
        font-size: 14px;
        line-height: 1.3;
    }
    .loc-empty {
        padding: 12px;
        border: 1px dashed #aaa;
        border-radius: 5px;
        color: #555;
        font-size: 14px;
    }
    .remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #b1b1b1;
        border-radius: 5px;
        background: transparent;
        color: #a31818;
        cursor: pointer;
        padding: 5px;
        flex-shrink: 0;
    }
    .remove-btn:hover {
        background: #fdf0f0;
    }
    .remove-btn:disabled {
        opacity: 0.5;
        cursor: default;
    }

    .add-location {
        display: flex;
        gap: 8px;
    }
    .add-location input {
        flex: 1;
        min-width: 0;
        padding: 9px 11px;
        border: 1px solid #888;
        border-radius: 5px;
        font: inherit;
        font-size: 14px;
    }
    .add-location button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border: 1px solid #151535;
        border-radius: 999px;
        background: #151535;
        color: #fff;
        font: inherit;
        font-size: 14px;
        cursor: pointer;
        flex-shrink: 0;
    }
    .add-location button:disabled {
        cursor: progress;
        opacity: 0.85;
    }

    .edit-field {
        display: flex;
        flex-direction: column;
        gap: 9px;
    }
    .edit-field input {
        width: 100%;
        padding: 9px 11px;
        border: 1px solid #888;
        border-radius: 5px;
        font: inherit;
        font-size: 14px;
    }
    .edit-field input:focus-visible,
    .add-location input:focus-visible {
        outline: 2px solid #19194f;
        outline-offset: 1px;
    }
    .edit-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .save-btn,
    .cancel-btn,
    .edit-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font: inherit;
        cursor: pointer;
        border-radius: 999px;
        flex-shrink: 0;
    }
    .save-btn {
        padding: 8px 16px;
        border: 1px solid #137333;
        background: #137333;
        color: #fff;
        font-size: 14px;
    }
    .save-btn:disabled {
        cursor: progress;
        opacity: 0.85;
    }
    .cancel-btn {
        padding: 8px 16px;
        border: 1px solid #9a9a9a;
        background: #fff;
        color: #111;
        font-size: 14px;
    }
    .edit-btn {
        padding: 8px 14px;
        border: 1px solid #9a9a9a;
        background: #fff;
        color: #111;
        font-size: 13px;
        align-self: flex-start;
    }
    .edit-btn.small {
        padding: 5px 10px;
        font-size: 12px;
    }
    .edit-btn:hover,
    .cancel-btn:hover {
        background: #f2f3f5;
    }
    .field-error {
        margin: 0;
        color: #a31818;
        font-size: 13px;
    }

    .spinner {
        display: inline-block;
        vertical-align: middle;
        width: 16px;
        height: 16px;
        border: 3px solid #e0e0e0;
        border-top-color: #151535;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .coupons {
        margin-top: 28px;
    }

    .employees-section {
        margin-top: 28px;
    }
    .employees-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
    }
    .employees-header h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
    }
    .refresh-btn {
        padding: 6px 14px;
        border: 1px solid #9a9a9a;
        border-radius: 999px;
        background: #fff;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
    }
    .refresh-btn:disabled {
        opacity: 0.6;
        cursor: default;
    }
    .employees-list {
        list-style: none;
        margin: 0 0 14px;
        padding: 0;
        display: grid;
        gap: 8px;
    }
    .employee-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid #888;
        border-radius: 6px;
        font-size: 14px;
    }
    .employee-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }
    .employee-email {
        font-weight: 600;
        word-break: break-all;
    }
    .employee-name {
        color: #555;
        font-size: 13px;
    }
    .employee-role {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        width: fit-content;
        padding: 1px 8px;
        border: 1px solid #aaa;
        border-radius: 999px;
        font-size: 11px;
        margin-top: 2px;
    }
    .employee-role.admin {
        border-color: #c9a000;
        background: #fff8db;
        color: #7a5a00;
    }
    .employee-email-detail {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #1a1f36;
        font-size: 13px;
        word-break: break-all;
    }
    .employee-no-account {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        width: fit-content;
        padding: 1px 8px;
        border: 1px dashed #c0392b;
        border-radius: 999px;
        background: #fdf0f0;
        color: #a31818;
        font-size: 11px;
        font-weight: 600;
    }
    .admin-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border: 1px solid #c9a000;
        border-radius: 999px;
        background: #fff8db;
        color: #7a5a00;
        font-size: 13px;
        font-weight: 600;
    }
    .employee-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }
    .promote-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: 1px solid #151535;
        border-radius: 999px;
        background: #fff;
        color: #151535;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
    }
    .promote-btn:hover {
        background: #f0f0ff;
    }
    .promote-btn:disabled {
        opacity: 0.5;
        cursor: default;
    }
    .add-employee {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    .add-employee input {
        flex: 1;
        min-width: 0;
        padding: 9px 11px;
        border: 1px solid #888;
        border-radius: 5px;
        font: inherit;
        font-size: 14px;
    }
    .add-employee input:focus-visible {
        outline: 2px solid #19194f;
        outline-offset: 1px;
    }
    .add-employee .add-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border: 1px solid #151535;
        border-radius: 999px;
        background: #151535;
        color: #fff;
        font: inherit;
        font-size: 14px;
        cursor: pointer;
        flex-shrink: 0;
        white-space: nowrap;
    }
    .add-employee .add-btn:disabled {
        cursor: progress;
        opacity: 0.85;
    }
    .spinner.small {
        width: 14px;
        height: 14px;
        border-width: 2px;
    }
    .spinner.small.dark {
        border-top-color: #151535;
    }
    .state.small {
        padding: 14px;
    }
    .coupons > h2 {
        text-align: center;
        font-size: 25px;
    }
    .coupon-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 22px;
    }
    .coupon {
        overflow: hidden;
        border: 1px solid #9a9a9a;
        border-radius: 3px;
        text-align: center;
    }
    .coupon img {
        display: block;
        width: 100%;
        height: 136px;
        object-fit: cover;
    }
    .coupon h3 {
        margin: 9px 8px 4px;
        font-size: 15px;
    }
    .coupon p {
        margin: 0 8px 14px;
        font-size: 13px;
    }
    .coupon b {
        display: inline-block;
        min-width: 38px;
        padding: 2px 8px;
        border: 1px solid #999;
        border-radius: 99px;
        font-size: 15px;
        font-weight: 400;
    }
    .state,
    .empty {
        padding: 24px;
        border: 1px solid #aaa;
        border-radius: 8px;
    }
    .error {
        color: #a31818;
    }

    .partner-selector {
        display: flex;
        gap: 10px;
        margin-bottom: 24px;
        overflow-x: auto;
        padding-bottom: 4px;
    }
    .partner-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        border: 1px solid #9a9a9a;
        border-radius: 999px;
        background: #fff;
        color: #111;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        transition:
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
    }
    .partner-tab:hover {
        border-color: #151535;
    }
    .partner-tab.active {
        background: #151535;
        border-color: #151535;
        color: #fff;
    }
    .partner-tab-logo {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        background: #eee;
    }
    @media (max-width: 780px) {
        .business-panel {
            padding: 30px 16px 64px;
        }
        .intro-row {
            align-items: stretch;
            flex-direction: column;
        }
        .metrics {
            min-width: 0;
            width: 100%;
        }
        .business-card {
            grid-template-columns: 1fr;
        }
        .coupon-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .partner-selector {
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 4px;
        }
        .partner-selector::-webkit-scrollbar {
            display: none;
        }
    }
    @media (max-width: 460px) {
        .metrics strong {
            font-size: 24px;
        }
        .metrics span {
            font-size: 10px;
        }
        .coupon-grid {
            grid-template-columns: 1fr;
        }
        .add-location {
            flex-direction: column;
        }
        .add-location button {
            width: 100%;
            justify-content: center;
        }
        .edit-actions {
            flex-direction: column;
        }
        .edit-actions button {
            width: 100%;
        }
        .name-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
    }
</style>
