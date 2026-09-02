<script lang="ts">
    import { onMount } from "svelte";

    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    import { accessToken } from "$lib/stores/authStore";
    import type { BenefitsCreateDTO } from "$lib/types/Benefit";

    let title = $state("");

    let description = $state("");

    let category = $state("");

    let selectedType = $state("");

    let selectedPartner = $state("");

    let paymentMethods = $state<string[]>([]);

    let imagePreview = $state("");

    let startDate = $state("");

    let startTime = $state("09:00");

    let endDate = $state("");

    let endTime = $state("18:00");

    let maxCoupons = $state(100);

    let maxPerUser = $state(1);

    let statusMessage = $state("");

    let sending = $state(false);

    let types = $state<{ id_type: number; name: string }[]>([]);

    let categories = $state<string[]>([]);

    let payments = $state<string[]>([]);

    let partners = $state<{ id_partner: string; name: string }[]>([]);

    function togglePayment(method: string) {
        paymentMethods = paymentMethods.includes(method)
            ? paymentMethods.filter((item) => item !== method)
            : [...paymentMethods, method];
    }

    async function loadOptions() {
        const token = accessToken.getToken();

        const [typesResponse, categoriesResponse, paymentsResponse, partnersResponse] =
            await Promise.all([
                fetch("/api/benefit-types/all"),
                fetch("/api/categories/actives"),
                fetch("/api/payment-methods/all"),
                fetch("/api/partners/all", {
                    credentials: "include",
                    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
                }),
            ]);

        if (typesResponse.ok) types = await typesResponse.json();

        if (categoriesResponse.ok) {
            categories = (await categoriesResponse.json()).map(
                (item: { name: string }) => item.name,
            );
        }
        if (paymentsResponse.ok) {
            payments = await paymentsResponse.json();
        }
        if (partnersResponse.ok) partners = await partnersResponse.json();
    }

    async function createBenefit(event: SubmitEvent) {
        event.preventDefault();

        statusMessage = "";

        const token = accessToken.getToken();

        if (!token) {
            statusMessage = "Tu sesión expiró. Volvé a iniciar sesión.";
            return;
        }

        if (
            !selectedType ||
            !selectedPartner ||
            !startDate ||
            !endDate ||
            !title.trim()
        ) {
            statusMessage =
                "Completá el título, tipo, negocio y período de publicación.";

            return;
        }

        sending = true;

        try {
            const payload: BenefitsCreateDTO = {
                id_admin: page.data.profile?.user_id ?? "",
                id_partner: selectedPartner,
                id_type: Number(selectedType),
                start_date: `${startDate} ${startTime || "00:00"}:00`,
                end_date: `${endDate} ${endTime || "00:00"}:00`,

                image: imagePreview,
                title: title.trim(),
                description: description.trim() || title.trim(),

                coupons: 0,
                max_coupons: Number(maxCoupons) || 100,
                max_per_user: Math.max(Number(maxPerUser) || 1, 1),
            };

            const response = await fetch("/api/benefits", {
                method: "POST",
                credentials: "include",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("No se pudo crear el beneficio.");

            await goto("/business-panel");
        } catch (error) {
            statusMessage =
                error instanceof Error
                    ? error.message
                    : "No se pudo crear el beneficio.";
        } finally {
            sending = false;
        }
    }

    onMount(loadOptions);
</script>

<svelte:head><title>Crear beneficio | CeCIT</title></svelte:head>

<section class="create-benefit">
    <div class="content">
        <header class="page-header">
            <div class="intro">
                <h1>Crear beneficio</h1>

                <p>
                    Configura los detalles de tu negocio,<br />administra tus
                    beneficios y visualiza tu<br />alcance
                </p>
            </div>

            <div class="metrics" aria-label="Resumen de beneficios">
                <div><b>04</b><span>UTILIZARON<br />BENEFICIOS</span></div>

                <div><b>10</b><span>CANJEARON<br />BENEFICIOS</span></div>

                <div><b>10</b><span>ACTIVOS<br />BENEFICIOS</span></div>
            </div>
        </header>

        <form class="benefit-form" onsubmit={createBenefit}>
            <h2>1. Información general del beneficio</h2>

            <label class="title-field"
                >Título<input
                    bind:value={title}
                    aria-label="Título del beneficio"
                /></label
            >

            <label class="partner-field"
                >Negocio<select
                    bind:value={selectedPartner}
                    aria-label="Negocio"
                    ><option value="">Seleccionar</option
                    >{#each partners as partner (partner.id_partner)}<option
                            value={partner.id_partner}
                            >{partner.name}</option
                        >{/each}</select
                ></label
            >

            <label class="description-field"
                >Descripción<textarea
                    bind:value={description}
                    rows="3"
                    placeholder="Detalles del beneficio…"
                    aria-label="Descripción del beneficio"
                ></textarea></label
            >

            <div class="form-grid top-grid">
                <section>
                    <h2>2. Imagen o banner</h2>

                    <label
                        class="upload-area"
                        class:preview={!!imagePreview}
                        aria-label="Link de la imagen o banner"
                    >
                        <input
                            type="text"
                            bind:value={imagePreview}
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />

                        {#if imagePreview}<img
                                src={imagePreview}
                                alt="Vista previa del banner"
                            />{:else}<span class="upload-arrow">⇧</span>{/if}
                    </label>
                </section>

                <section class="category-type">
                    <label
                        >3. Categoría<select
                            bind:value={category}
                            aria-label="Categoría"
                            ><option value="">Seleccionar</option
                            >{#each categories as item}<option value={item}
                                    >{item}</option
                                >{/each}</select
                        ></label
                    >

                    <fieldset>
                        <legend>4. Tipo</legend>
                        <div class="type-options">
                            {#each types as type}<button
                                    type="button"
                                    class:selected={selectedType ===
                                        String(type.id_type)}
                                    onclick={() =>
                                        (selectedType = String(type.id_type))}
                                    >{type.name}</button
                                >{/each}
                        </div>
                    </fieldset>
                </section>
            </div>

            <div class="form-grid lower-grid">
                <section>
                    <h2>5. Fecha de publicación</h2>

                    <div class="date-row">
                        <input
                            type="date"
                            bind:value={startDate}
                            aria-label="Fecha inicio"
                        /><span>/</span><input
                            type="time"
                            bind:value={startTime}
                            aria-label="Hora inicio"
                        />
                    </div>

                    <div class="date-row">
                        <input
                            type="date"
                            bind:value={endDate}
                            aria-label="Fecha fin"
                        /><span>/</span><input
                            type="time"
                            bind:value={endTime}
                            aria-label="Hora fin"
                        />
                    </div>

                    <fieldset class="payments">
                        <legend>6. Medios de pago</legend
                        >{#each payments as method}<button
                                type="button"
                                class:selected={paymentMethods.includes(method)}
                                onclick={() => togglePayment(method)}
                                >{method}</button
                            >{/each}
                    </fieldset>
                </section>

                <section class="limits">
                    <label
                        >7. Límites de Usos
                        <div class="per-user">
                            <input
                                type="number"
                                bind:value={maxPerUser}
                                min="1"
                            /><span>Por Usuario</span>
                        </div></label
                    >

                    <label
                        >8. Cantidad de cupones<input
                            bind:value={maxCoupons}
                            type="number"
                            min="1"
                            placeholder="100"
                        /></label
                    >

                    <label
                        >9. Tope de reintegro<input
                            placeholder="$99999"
                        /></label
                    >

                    <label
                        >10. Valor del descuento<input
                            type="number"
                            min="0"
                            placeholder="0"
                        /></label
                    >
                </section>
            </div>

            {#if statusMessage}<p class="status" role="alert">
                    {statusMessage}
                </p>{/if}

            <button class="create-button" type="submit" disabled={sending}
                >{sending ? "Creando..." : "Crear beneficio"}</button
            >
        </form>
    </div>
</section>

<style>
    .create-benefit {
        min-height: 74vh;
        padding: 34px 24px 72px;
        background: #fff;
        color: #080808;
    }

    .content {
        width: min(100%, 1135px);
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 40px;
        margin: 0 2px 27px;
    }

    h1 {
        margin: 0;
        font-size: 30px;
        line-height: 1.1;
    }
    .intro p {
        margin: 6px 0 0;
        font-size: 17px;
        line-height: 1.28;
    }

    .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        min-width: 505px;
        border: 1px solid #888;
        border-radius: 8px;
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

    .metrics b {
        font-size: 31px;
        font-weight: 400;
    }
    .metrics span {
        font-size: 12px;
        text-align: center;
        line-height: 1.2;
    }

    .benefit-form {
        border: 1px solid #929292;
        border-radius: 8px;
        padding: 22px 26px 32px;
    }

    h2,
    legend,
    label {
        font-size: 20px;
        font-weight: 400;
    }
    h2 {
        margin: 0 0 8px;
    }
    label {
        display: grid;
        gap: 6px;
    }

    input,
    select,
    textarea {
        box-sizing: border-box;
        width: 100%;
        height: 36px;
        padding: 6px 11px;
        border: 1px solid #989898;
        border-radius: 7px;
        background: #fff;
        font: inherit;
        color: #111;
    }

    textarea {
        height: auto;
        resize: vertical;
    }

    .title-field,
    .partner-field,
    .description-field {
        margin-left: 3px;
    }
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1.25fr;
        gap: 62px;
    }
    .top-grid {
        margin-top: 22px;
    }

    .upload-area {
        position: relative;
        display: grid;
        place-items: center;
        width: 300px;
        gap: 10px;
        padding: 14px;
        border: 1px solid #888;
        border-radius: 7px;
        overflow: hidden;
    }

    .upload-area input {
        height: 36px;
    }

    .upload-area.preview {
        padding: 0;
    }
    .upload-area.preview input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: auto;
        z-index: 2;
        opacity: 0;
    }
    .upload-arrow {
        font-size: 76px;
        line-height: 0.8;
        font-weight: 700;
    }
    .upload-area img {
        width: 300px;
        height: 155px;
        object-fit: cover;
        display: block;
    }

    .category-type {
        display: grid;
        align-content: start;
        gap: 16px;
    }
    fieldset {
        border: 0;
        margin: 0;
        padding: 0;
    }
    legend {
        margin-bottom: 8px;
    }
    .type-options {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
    }

    button {
        min-width: 52px;
        padding: 6px 11px;
        border: 1px solid #8f8f8f;
        border-radius: 6px;
        background: white;
        font: inherit;
        cursor: pointer;
    }
    button.selected {
        background: #151535;
        border-color: #151535;
        color: white;
    }

    .lower-grid {
        margin-top: 27px;
    }
    .date-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 9px;
    }
    .date-row input {
        max-width: 205px;
    }
    .date-row span {
        font-size: 22px;
    }

    .payments {
        margin: 22px 0 0 3px;
    }
    .payments button {
        display: block;
        min-width: 194px;
        margin-bottom: 10px;
        text-align: left;
    }

    .limits {
        display: grid;
        align-content: end;
        gap: 10px;
        padding-top: 159px;
    }
    .per-user {
        display: flex;
        align-items: center;
        gap: 11px;
    }
    .per-user input {
        max-width: 136px;
        text-align: center;
    }
    .per-user span {
        white-space: nowrap;
        font-size: 17px;
    }

    .create-button {
        display: block;
        margin: 16px 0 0 auto;
        border-color: var(--primary-blue);
        background: var(--primary-blue);
        color: white;
    }
    .create-button:disabled {
        opacity: 0.65;
        cursor: wait;
    }
    .status {
        margin: 16px 0 0;
        color: #a31d1d;
        font-size: 15px;
    }

    @media (max-width: 800px) {
        .page-header {
            align-items: stretch;
            flex-direction: column;
        }
        .metrics {
            min-width: 0;
        }
        .form-grid {
            grid-template-columns: 1fr;
            gap: 25px;
        }
        .limits {
            padding-top: 0;
        }
    }

    @media (max-width: 500px) {
        .create-benefit {
            padding: 26px 14px 50px;
        }
        .benefit-form {
            padding: 18px;
        }
        .date-row {
            flex-wrap: wrap;
        }
        .date-row input {
            max-width: 100%;
        }
        .metrics b {
            font-size: 25px;
        }
        .metrics span {
            font-size: 10px;
        }
    }
</style>
