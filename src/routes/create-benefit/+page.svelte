<script lang="ts">
    import { onMount } from "svelte";

    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    import { accessToken } from "$lib/stores/authStore";
    import type { BenefitsCreateDTO } from "$lib/types/Benefit";

    let title = $state("");

    let description = $state("");

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

    let payments = $state<string[]>([]);

    let partners = $state<{ id_partner: string; name: string }[]>([]);

    function togglePayment(method: string) {
        paymentMethods = paymentMethods.includes(method)
            ? paymentMethods.filter((item) => item !== method)
            : [...paymentMethods, method];
    }

    async function loadOptions() {
        const token = accessToken.getToken();

        const [typesResponse, paymentsResponse, partnersResponse] =
            await Promise.all([
                fetch("/api/benefit-types/all"),
                fetch("/api/payment-methods/all"),
                fetch("/api/partners/all", {
                    credentials: "include",
                    ...(token
                        ? { headers: { Authorization: `Bearer ${token}` } }
                        : {}),
                }),
            ]);

        if (typesResponse.ok) types = await typesResponse.json();

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

                payment_methods: paymentMethods,

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
    <div class="inner">
        <div class="intro-row">
            <div>
                <h1>Crear beneficio</h1>
                <p>
                    Configura los detalles de tu negocio, administra tus
                    beneficios y visualiza tu alcance.
                </p>
            </div>
            <div class="metrics" aria-label="Resumen de beneficios">
                <div><strong>04</strong><span>UTILIZARON<br />BENEFICIOS</span></div>

                <div><strong>10</strong><span>CANJEARON<br />BENEFICIOS</span></div>

                <div><strong>10</strong><span>ACTIVOS<br />BENEFICIOS</span></div>
            </div>
        </div>

        <form class="benefit-form" onsubmit={createBenefit}>
            <section class="card">
                <h2>
                    <span class="step">1</span> Información general del beneficio
                </h2>

                <div class="fields-grid">
                    <label class="field"
                        ><span class="field-label">Título</span><input
                            bind:value={title}
                            placeholder="Ej: 20% off en cafetería"
                            aria-label="Título del beneficio"
                        /></label
                    >

                    <label class="field"
                        ><span class="field-label">Negocio</span><select
                            bind:value={selectedPartner}
                            aria-label="Negocio"
                            ><option value="">Seleccionar</option
                            >{#each partners as partner (partner.id_partner)}<option
                                    value={partner.id_partner}
                                    >{partner.name}</option
                                >{/each}</select
                        ></label
                    >
                </div>

                <label class="field"
                    ><span class="field-label">Descripción</span><textarea
                        bind:value={description}
                        rows="3"
                        placeholder="Detalles del beneficio…"
                        aria-label="Descripción del beneficio"
                    ></textarea></label
                >
                <p class="hint">
                    La categoría se asigna automáticamente según el negocio
                    seleccionado.
                </p>
            </section>

            <div class="form-grid">
                <section class="card">
                    <h2><span class="step">2</span> Imagen o banner</h2>

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
                            />{:else}<span class="upload-empty">
                                <span class="upload-icon" aria-hidden="true"
                                    >⇧</span
                                >
                                <span>Pegá la URL de la imagen del beneficio</span>
                            </span>{/if}
                    </label>
                </section>

                <section class="card">
                    <h2><span class="step">3</span> Tipo</h2>
                    <fieldset>
                        <legend class="sr-only">Tipo de beneficio</legend>
                        <div class="chip-row">
                            {#each types as type}<button
                                    type="button"
                                    class="chip"
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

            <div class="form-grid">
                <section class="card">
                    <h2><span class="step">4</span> Fecha de publicación</h2>

                    <div class="date-row">
                        <input
                            type="date"
                            bind:value={startDate}
                            aria-label="Fecha inicio"
                        /><span class="date-sep">/</span><input
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
                        /><span class="date-sep">/</span><input
                            type="time"
                            bind:value={endTime}
                            aria-label="Hora fin"
                        />
                    </div>

                    <fieldset class="payments">
                        <legend>
                            <span class="step small">5</span> Medios de pago
                        </legend>
                        <div class="chip-col">
                            {#each payments as method}<button
                                    type="button"
                                    class="chip left"
                                    class:selected={paymentMethods.includes(
                                        method,
                                    )}
                                    onclick={() => togglePayment(method)}
                                    >{method}</button
                                >{/each}
                        </div>
                    </fieldset>
                </section>

                <section class="card">
                    <h2><span class="step">6</span> Límites y valores</h2>

                    <label class="field"
                        ><span class="field-label">Límite por usuario</span>
                        <div class="per-user">
                            <input
                                type="number"
                                bind:value={maxPerUser}
                                min="1"
                            /><span>Por usuario</span>
                        </div></label
                    >

                    <label class="field"
                        ><span class="field-label">Cantidad de cupones</span><input
                            bind:value={maxCoupons}
                            type="number"
                            min="1"
                            placeholder="100"
                        /></label
                    >

                    <label class="field"
                        ><span class="field-label">Tope de reintegro</span><input
                            placeholder="$99999"
                        /></label
                    >

                    <label class="field"
                        ><span class="field-label">Valor del descuento</span><input
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

            <div class="form-actions">
                <button
                    class="ghost-button"
                    type="button"
                    onclick={() => goto("/business-panel")}>Cancelar</button
                >
                <button class="create-button" type="submit" disabled={sending}
                    >{sending ? "Creando..." : "Crear beneficio"}</button
                >
            </div>
        </form>
    </div>
</section>

<style>
    .create-benefit {
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
        font-weight: 700;
        letter-spacing: -0.2px;
    }

    .intro-row > div > p {
        max-width: 390px;
        margin: 6px 0 0;
        font-size: 17px;
        line-height: 1.3;
        color: #333;
    }

    .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        min-width: 505px;
        border: 1px solid #777;
        border-radius: 9px;
        padding: 14px 0;
        background: #fff;
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

    .benefit-form {
        display: grid;
        gap: 20px;
    }

    .card {
        border: 1px solid #969696;
        border-radius: 8px;
        padding: 26px 28px;
        background: #fff;
        box-shadow: 0 8px 18px rgb(0 0 0 / 06%);
    }

    h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 16px;
        font-size: 20px;
        font-weight: 600;
    }

    .step {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 8px;
        border-radius: 999px;
        background: #19194f;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
    }

    .step.small {
        min-width: 24px;
        height: 24px;
        font-size: 13px;
    }

    fieldset {
        border: 0;
        margin: 0;
        padding: 0;
    }

    fieldset legend {
        margin-bottom: 12px;
        padding: 0;
        font-size: 20px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
    }

    .fields-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
    }

    .field {
        display: grid;
        gap: 8px;
        margin-bottom: 14px;
    }

    .field:last-child {
        margin-bottom: 0;
    }

    .field-label {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        color: #19194f;
    }

    input,
    select,
    textarea {
        box-sizing: border-box;
        width: 100%;
        min-height: 44px;
        padding: 10px 14px;
        border: 1px solid #9a9a9a;
        border-radius: 10px;
        background: #fff;
        font: inherit;
        font-size: 15px;
        color: #111;
    }

    textarea {
        min-height: 88px;
        resize: vertical;
    }

    input::placeholder,
    textarea::placeholder {
        color: #8a8a8a;
    }

    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
        outline: 2px solid #19194f;
        outline-offset: 1px;
        border-color: #19194f;
    }

    .hint {
        margin: 12px 0 0;
        font-size: 13px;
        color: #555;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1.1fr;
        gap: 20px;
    }

    .upload-area {
        position: relative;
        display: grid;
        place-items: center;
        gap: 10px;
        padding: 16px;
        border: 1.5px dashed #9a9a9a;
        border-radius: 12px;
        background: #f4f5f7;
        overflow: hidden;
    }

    .upload-area input {
        background: #fff;
    }

    .upload-area.preview {
        padding: 12px;
    }

    .upload-area img {
        width: 100%;
        height: 220px;
        object-fit: cover;
        display: block;
        border-radius: 8px;
        border: 1px solid #d2d4da;
        background: #fff;
    }

    .upload-empty {
        display: grid;
        place-items: center;
        gap: 6px;
        padding: 26px 12px;
        color: #555;
        font-size: 14px;
        text-align: center;
    }

    .upload-icon {
        font-size: 34px;
        line-height: 1;
        font-weight: 700;
        color: #19194f;
    }

    .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .chip-col {
        display: grid;
        gap: 10px;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        border: 1px solid #9a9a9a;
        border-radius: 999px;
        background: #fff;
        color: #111;
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition:
            background-color 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease;
    }

    .chip:hover {
        background: #eef0f4;
        border-color: #19194f;
    }

    .chip:focus-visible {
        outline: 2px solid #19194f;
        outline-offset: 2px;
    }

    .chip.selected {
        background: #19194f;
        border-color: #19194f;
        color: #fff;
    }

    .chip.left {
        justify-content: flex-start;
        width: fit-content;
        min-width: 194px;
    }

    .payments {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #ececf0;
    }

    .date-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
    }

    .date-row:last-of-type {
        margin-bottom: 0;
    }

    .date-sep {
        font-size: 20px;
        color: #777;
    }

    .per-user {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .per-user input {
        max-width: 140px;
        text-align: center;
    }

    .per-user span {
        white-space: nowrap;
        font-size: 14px;
        color: #333;
    }

    .status {
        margin: 0;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        background: #ffebee;
        border: 1px solid #ef9a9a;
        color: #b71c1c;
        font-size: 14px;
        font-weight: 500;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        align-items: center;
    }

    .ghost-button,
    .create-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 28px;
        border-radius: 999px;
        font: inherit;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition:
            background-color 0.15s ease,
            transform 0.15s ease;
    }

    .ghost-button {
        border: 1px solid #9a9a9a;
        background: #fff;
        color: #111;
    }

    .ghost-button:hover {
        background: #f2f3f5;
    }

    .create-button {
        border: 1px solid #19194f;
        background: #19194f;
        color: #fff;
        min-width: 210px;
    }

    .create-button:hover:not(:disabled) {
        background: #2a2a7d;
        border-color: #2a2a7d;
    }

    .create-button:disabled {
        opacity: 0.65;
        cursor: wait;
    }

    @media (max-width: 900px) {
        .create-benefit {
            padding: 30px 16px 64px;
        }
        .intro-row {
            align-items: stretch;
            flex-direction: column;
        }
        .metrics {
            min-width: 0;
        }
        .form-grid,
        .fields-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 500px) {
        .card {
            padding: 20px;
        }
        .metrics strong {
            font-size: 24px;
        }
        .metrics span {
            font-size: 10px;
        }
        .form-actions {
            flex-direction: column-reverse;
            align-items: stretch;
        }
        .ghost-button,
        .create-button {
            width: 100%;
        }
    }
</style>
