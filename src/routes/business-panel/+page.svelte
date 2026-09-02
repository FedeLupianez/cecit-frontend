<script lang="ts">
    import { onMount } from "svelte";
    import { accessToken } from "$lib/stores/authStore";
    import { Pencil, Plus, Trash2 } from "lucide-svelte";

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

    let partner: Partner | undefined = $state();
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

    const used = $derived(
        benefits.reduce((total, benefit) => total + benefit.coupons, 0),
    );
    const active = $derived(
        benefits.filter((benefit) => benefit.status === "ACTIVE").length,
    );

    function authHeaders() {
        return { Authorization: `Bearer ${accessToken.getToken()}` };
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

    async function loadPanel() {
        const token = accessToken.getToken();
        if (!token) {
            error = "Tu sesión expiró. Volvé a iniciar sesión.";
            loading = false;
            return;
        }

        try {
            const partnerResponse = await fetch("/api/partners-admins/me", {
                headers: authHeaders(),
                credentials: "include",
            });
            if (
                partnerResponse.status === 401 ||
                partnerResponse.status === 403
            ) {
                error = "No tenés permiso para ver el panel de negocio.";
                return;
            }
            if (!partnerResponse.ok)
                throw new Error("No se pudo obtener el negocio.");
            partner = await partnerResponse.json();
            console.log(partner);

            const benefitsResponse = await fetch("/api/benefits/actives");
            if (!benefitsResponse.ok)
                throw new Error("No se pudieron obtener los beneficios.");
            benefits = (await benefitsResponse.json()).filter(
                (benefit: Benefit) =>
                    benefit.id_partner === partner?.id_partner,
            );

            const vouchers = await Promise.all(
                benefits.map(async (benefit): Promise<Voucher[]> => {
                    const response = await fetch(
                        `/api/vouchers/bybenefit?id_benefit=${benefit.id_benefit}`,
                    );
                    return response.ok ? await response.json() : [];
                }),
            );
            redeemed = vouchers
                .flat()
                .filter((voucher) => voucher.status === "DELIVERED").length;

            await loadLocations();
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
            const response = await fetch(
                `/api/partners/locations?id_partner=${encodeURIComponent(partner.id_partner)}`,
                { headers: authHeaders(), credentials: "include" },
            );
            if (!response.ok) {
                locationsError = "No se pudieron cargar las ubicaciones.";
                locations = [];
                return;
            }
            locations = await response.json();
            locationsError = "";
        } catch {
            locationsError = "No se pudieron cargar las ubicaciones.";
        }
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
            const response = await fetch("/api/partners/name", {
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
                return;
            }
            const data = await response.json();
            partner.name = data?.name ?? new_name.toLowerCase();
            editingName = false;
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
            const response = await fetch("/api/partners/logo", {
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
                return;
            }
            const data = await response.json();
            partner.logo = data?.logo ?? new_logo;
            editingLogo = false;
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
            const response = await fetch("/api/partners/locations", {
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
                return;
            }
            const created = await response.json();
            locations = [...locations, created];
            locationInput = "";
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
            const response = await fetch(
                `/api/partners/locations?id_location=${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                    credentials: "include",
                },
            );
            if (!response.ok) {
                locationsError = await parseError(response);
                return;
            }
            locations = locations.filter(
                (location) => location.id_location !== id,
            );
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
        {:else if error}
            <p class="state error" role="alert">{error}</p>
        {:else if partner}
            <section class="business-card">
                <div class="logo-col">
                    <img
                        class="logo"
                        src={partner.logo}
                        alt={`Logo de ${partner.name}`}
                    />

                    {#if editingLogo}
                        <div class="edit-field">
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
                                    onclick={cancelEditLogo}>Cancelar</button
                                >
                            </div>
                            {#if logoError}
                                <p class="field-error" role="alert">
                                    {logoError}
                                </p>
                            {/if}
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
                        <div class="edit-field">
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
                                    onclick={cancelEditName}>Cancelar</button
                                >
                            </div>
                            {#if nameError}
                                <p class="field-error" role="alert">
                                    {nameError}
                                </p>
                            {/if}
                        </div>
                    {/if}

                    <details>
                        <summary>Contacto</summary>
                        <p>La API actual no proporciona datos de contacto.</p>
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
                                        removeLocation(location.id_location)}
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

                    {#if addingLocationError}
                        <p class="field-error" role="alert">
                            {addingLocationError}
                        </p>
                    {:else if locationsError}
                        <p class="field-error" role="alert">{locationsError}</p>
                    {/if}
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
    .coupons {
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
    }
    details p {
        margin: 8px 0 0;
        color: #555;
        font-size: 14px;
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
        }
        .business-card {
            grid-template-columns: 1fr;
        }
        .coupon-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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
    }
</style>
