<script lang="ts">
    import { goto } from "$app/navigation";
    import { Check, Pencil, X, XCircle } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { profileStore } from "$lib/stores/profileStore";
    import { mockBenefitRequests, type BenefitRequest } from "$lib/data/benefitRequests";

    let requests = $state<BenefitRequest[]>(mockBenefitRequests.map((request) => ({ ...request })));
    let editing = $state<BenefitRequest | null>(null);
    let decisionTarget = $state<BenefitRequest | null>(null);

    $effect(() => {
        const profile = profileStore.getProfile();
        if (profile && profile.role !== "CECIT_ADMIN") goto("/");
    });

    function updateStatus(request: BenefitRequest, status: "ACCEPTED" | "REJECTED") {
        requests = requests.map((item) => item.id === request.id ? { ...item, status } : item);
        decisionTarget = null;
        toast.success(status === "ACCEPTED" ? "Solicitud aceptada" : "Solicitud rechazada");
    }

    function saveChanges() {
        if (!editing) return;
        requests = requests.map((item) => item.id === editing?.id ? { ...editing } : item);
        editing = null;
        toast.success("Cambios guardados");
    }
</script>

<svelte:head><title>Aceptación de beneficios | CeCIT</title></svelte:head>

<section class="requests-page">
    <div class="page-inner">
        <h1>ACEPTACIÓN DE BENEFICIOS</h1>
        <div class="requests-grid">
            {#each requests as request (request.id)}
                <article class="request-card">
                    <img class="benefit-image" src={request.image} alt={request.title} />
                    <div class="benefit-heading">
                        <strong>{request.title}</strong>
                        <div class="partner-row"><span class="partner-mark">♙</span><small>{request.partner}</small><span class="status" class:accepted={request.status === "ACCEPTED"} class:rejected={request.status === "REJECTED"}>{request.status === "PENDING" ? "Pendiente" : request.status === "ACCEPTED" ? "Aceptada" : "Rechazada"}</span></div>
                    </div>
                    <div class="request-details">
                        <p class="description"><b>DESCRIPCIÓN:</b> {request.description}</p>
                        <p><b>VIGENCIA:</b> {request.startDate} - {request.endDate}</p>
                        <p><b>FECHA DE SOLICITUD:</b> {request.requestedAt}</p>
                        <p><b>ENVIADO POR:</b> {request.requestedBy}</p>
                        <div class="actions">
                            <button class="edit" onclick={() => editing = { ...request }} aria-label={`Editar ${request.title}`}><Pencil size={11} /> EDITAR</button>
                            <button class="reject" disabled={request.status !== "PENDING"} onclick={() => decisionTarget = request}><X size={11} /> RECHAZAR</button>
                            <button class="accept" disabled={request.status !== "PENDING"} onclick={() => updateStatus(request, "ACCEPTED")}><Check size={11} /> ACEPTAR</button>
                        </div>
                    </div>
                </article>
            {/each}
        </div>
    </div>
</section>

{#if editing}
    <div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && (editing = null)}>
        <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="edit-title">
            <button class="close" aria-label="Cerrar" onclick={() => editing = null}><XCircle size={22} /></button>
            <h2 id="edit-title">Editar solicitud</h2>
            <label>Título<input bind:value={editing.title} /></label>
            <label>Comercio<input bind:value={editing.partner} /></label>
            <label>Imagen (URL)<input bind:value={editing.image} /></label>
            <label>Descripción<textarea rows="3" bind:value={editing.description}></textarea></label>
            <div class="date-fields"><label>Desde<input bind:value={editing.startDate} /></label><label>Hasta<input bind:value={editing.endDate} /></label></div>
            <button class="save" onclick={saveChanges}>Guardar cambios</button>
        </section>
    </div>
{/if}

{#if decisionTarget}
    <div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && (decisionTarget = null)}>
        <section class="dialog confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reject-title">
            <h2 id="reject-title">¿Rechazar solicitud?</h2>
            <p>La solicitud de <b>{decisionTarget.title}</b> quedará marcada como rechazada.</p>
            <div class="confirm-actions"><button class="cancel" onclick={() => decisionTarget = null}>Cancelar</button><button class="reject" onclick={() => decisionTarget && updateStatus(decisionTarget, "REJECTED")}>Rechazar</button></div>
        </section>
    </div>
{/if}

<style>
    .requests-page { min-height: 620px; background: #f5f8ff; padding: 22px 3.5% 42px; color: #111; }
    .page-inner { max-width: 1160px; margin: 0 auto; }
    h1 { color: #191936; font-size: clamp(1.65rem, 4vw, 2.5rem); line-height: 1.1; margin: 0 0 20px; font-weight: 750; letter-spacing: -.035em; }
    .requests-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px 11px; max-width: 560px; margin: 0 auto; }
    .request-card { min-width: 0; overflow: hidden; border: 1px solid #8a8a8a; background: #f5f8ff; }
    .benefit-image { display: block; width: 100%; height: 102px; object-fit: cover; }
    .benefit-heading { min-height: 34px; padding: 4px 6px 3px; border-bottom: 1px solid #8a8a8a; }
    .benefit-heading strong { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 10px; line-height: 12px; }
    .partner-row { height: 12px; display: flex; align-items: center; gap: 4px; }
    .partner-row small { font-size: 7px; }
    .partner-mark { color: #e23134; font-size: 11px; line-height: 1; }
    .status { margin-left: auto; padding: 2px 8px; background: #191936; color: white; border-radius: 9px; font-size: 6px; }
    .status.accepted { background: #17c900; }.status.rejected { background: #df1010; }
    .request-details { padding: 6px 7px 20px; font-size: 9px; }
    .request-details p { margin: 0 0 7px; line-height: 1.15; }
    .request-details p.description { min-height: 29px; margin-bottom: 5px; }
    .request-details b { font-weight: 750; }
    .actions { display: flex; gap: 8px; margin-top: 8px; }
    .actions button, .confirm-actions button { border: 0; border-radius: 14px; color: white; min-height: 23px; padding: 0 8px; font-size: 7px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 3px; cursor: pointer; }
    .actions button { flex: 1; }
    .edit { background: #191936; }.reject { background: #e41414; }.accept { background: #16c900; }
    .actions button:disabled { opacity: .48; cursor: default; }
    .modal-backdrop { position: fixed; inset: 0; z-index: 20; display: grid; place-items: center; padding: 20px; background: rgb(13 15 39 / 55%); }
    .dialog { position: relative; width: min(100%, 480px); padding: 25px; border-radius: 12px; background: white; box-shadow: 0 18px 60px rgb(0 0 0 / 25%); }
    .dialog h2 { margin: 0 0 18px; color: #191936; font-size: 21px; }
    .dialog label { display: grid; gap: 5px; margin: 0 0 12px; color: #34344a; font-size: 13px; font-weight: 650; }
    .dialog input, .dialog textarea { width: 100%; border: 1px solid #c9cbd5; border-radius: 6px; padding: 9px 10px; font: inherit; font-weight: 400; color: #111; }
    .dialog textarea { resize: vertical; }.date-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .close { position: absolute; top: 17px; right: 17px; border: 0; background: transparent; color: #555; cursor: pointer; }
    .save { display: block; margin: 18px 0 0 auto; padding: 10px 17px; border: 0; border-radius: 18px; background: #191936; color: white; font-weight: 700; cursor: pointer; }
    .confirm-dialog p { color: #555; font-size: 14px; line-height: 1.5; }.confirm-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 23px; }.confirm-actions button { min-height: 34px; padding: 0 16px; font-size: 12px; }.confirm-actions .cancel { color: #222; background: #e9eaf0; }
    @media (max-width: 600px) { .requests-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 480px) { .requests-page { padding: 22px 15px 34px; } .requests-grid { grid-template-columns: 1fr; max-width: 340px; } .benefit-image { height: 150px; } .request-details { font-size: 11px; padding: 8px 9px 14px; } .actions button { min-height: 30px; font-size: 9px; } }
</style>
