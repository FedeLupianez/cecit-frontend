<script lang="ts">
    import { onMount } from 'svelte';
    import { accessToken } from '$lib/stores/authStore';

    interface Partner {
        id_partner: string;
        name: string;
        logo: string;
        direction: string;
        active: boolean;
    }

    interface Benefit {
        id_benefit: string;
        id_partner: string;
        title: string;
        image: string;
        coupons: number;
        max_coupons: number;
        status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    }

    interface Voucher { status: 'PENDING' | 'DELIVERED' | 'EXPIRED' }

    let partner: Partner | undefined = $state();
    let benefits: Benefit[] = $state([]);
    let redeemed = $state(0);
    let loading = $state(true);
    let error = $state('');

    const used = $derived(benefits.reduce((total, benefit) => total + benefit.coupons, 0));
    const active = $derived(benefits.filter((benefit) => benefit.status === 'ACTIVE').length);

    async function loadPanel() {
        const token = accessToken.getToken();
        if (!token) {
            error = 'Tu sesión expiró. Volvé a iniciar sesión.';
            loading = false;
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const partnerResponse = await fetch('/api/partners/me', { headers, credentials: 'include' });
            if (partnerResponse.status === 401 || partnerResponse.status === 403) {
                error = 'No tenés permiso para ver el panel de negocio.';
                return;
            }
            if (!partnerResponse.ok) throw new Error('No se pudo obtener el negocio.');
            partner = await partnerResponse.json();

            const benefitsResponse = await fetch('/api/benefits/all');
            if (!benefitsResponse.ok) throw new Error('No se pudieron obtener los beneficios.');
            benefits = (await benefitsResponse.json()).filter(
                (benefit: Benefit) => benefit.id_partner === partner?.id_partner,
            );

            const vouchers = await Promise.all(
                benefits.map(async (benefit): Promise<Voucher[]> => {
                    const response = await fetch(`/api/vouchers/bybenefit?id_benefit=${benefit.id_benefit}`);
                    return response.ok ? await response.json() : [];
                }),
            );
            redeemed = vouchers.flat().filter((voucher) => voucher.status === 'DELIVERED').length;
        } catch (cause) {
            error = cause instanceof Error ? cause.message : 'No se pudo cargar el panel.';
        } finally {
            loading = false;
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
                <p>Configura los detalles de tu negocio, administra tus beneficios y visualiza tu alcance.</p>
            </div>
            <div class="metrics" aria-label="Resumen de beneficios">
                <div><strong>{used}</strong><span>UTILIZARON<br />BENEFICIOS</span></div>
                <div><strong>{redeemed}</strong><span>CANJEARON<br />BENEFICIOS</span></div>
                <div><strong>{active}</strong><span>ACTIVOS<br />BENEFICIOS</span></div>
            </div>
        </div>

        {#if loading}
            <p class="state">Cargando información del negocio...</p>
        {:else if error}
            <p class="state error" role="alert">{error}</p>
        {:else if partner}
            <section class="business-card">
                <img class="logo" src={partner.logo} alt={`Logo de ${partner.name}`} />
                <div class="business-details">
                    <h2>{partner.name}</h2>
                    <details><summary>Contacto</summary><p>La API actual no proporciona datos de contacto.</p></details>
                    <details><summary>Horarios</summary><p>La API actual no proporciona horarios.</p></details>
                    <details><summary>Galería</summary><p>La API actual no proporciona una galería.</p></details>
                </div>
                <div class="location"><h3>Ubicación</h3><div>{partner.direction || 'Sin dirección registrada'}</div></div>
            </section>

            <section class="coupons">
                <h2>Tus Cupones</h2>
                <div class="coupon-grid">
                    {#each benefits as benefit}
                        <article class="coupon">
                            <img src={benefit.image} alt={benefit.title} />
                            <h3>{benefit.title}</h3>
                            <p><b>{benefit.coupons}</b> / <b>{benefit.max_coupons}</b> CANJEADOS</p>
                        </article>
                    {:else}
                        <p class="empty">Todavía no tenés beneficios cargados.</p>
                    {/each}
                </div>
            </section>
        {/if}
    </div>
</section>

<style>
    .business-panel { min-height: 70vh; padding: 50px 24px 88px; background: #fff; color: #111; }
    .inner { width: min(100%, 1160px); margin: 0 auto; }
    .intro-row { display: flex; align-items: center; justify-content: space-between; gap: 36px; margin-bottom: 28px; }
    h1 { margin: 0; font-size: 30px; } .intro-row > div > p { max-width: 390px; margin: 6px 0 0; font-size: 17px; line-height: 1.3; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); min-width: 505px; border: 1px solid #777; border-radius: 9px; padding: 14px 0; }
    .metrics div { display: grid; place-items: center; gap: 5px; border-right: 1px solid #aaa; } .metrics div:last-child { border: 0; }
    .metrics strong { font-size: 30px; font-weight: 500; } .metrics span { text-align: center; font-size: 12px; line-height: 1.25; }
    .business-card, .coupons { border: 1px solid #969696; border-radius: 8px; padding: 26px 28px; }
    .business-card { display: grid; grid-template-columns: 140px minmax(220px, 1fr) 200px; gap: 26px; align-items: start; }
    .logo { width: 140px; height: 140px; border-radius: 6px; object-fit: cover; background: #eee; }
    .business-details h2, .coupons h2 { margin: 4px 0 12px; font-size: 23px; font-weight: 500; } details { border-top: 1px solid #9a9a9a; padding: 9px 0; } summary { cursor: pointer; font-size: 17px; } details p { margin: 8px 0 0; color: #555; font-size: 14px; }
    .location h3 { margin: 4px 0 9px; font-size: 17px; font-weight: 500; } .location div { min-height: 108px; padding: 12px; border: 1px solid #888; border-radius: 5px; font-size: 14px; }
    .coupons { margin-top: 28px; } .coupons > h2 { text-align: center; font-size: 25px; }
    .coupon-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; } .coupon { overflow: hidden; border: 1px solid #9a9a9a; border-radius: 3px; text-align: center; }
    .coupon img { display: block; width: 100%; height: 136px; object-fit: cover; } .coupon h3 { margin: 9px 8px 4px; font-size: 15px; } .coupon p { margin: 0 8px 14px; font-size: 13px; } .coupon b { display: inline-block; min-width: 38px; padding: 2px 8px; border: 1px solid #999; border-radius: 99px; font-size: 15px; font-weight: 400; }
    .state, .empty { padding: 24px; border: 1px solid #aaa; border-radius: 8px; } .error { color: #a31818; }
    @media (max-width: 780px) { .business-panel { padding: 30px 16px 64px; } .intro-row { align-items: stretch; flex-direction: column; } .metrics { min-width: 0; } .business-card { grid-template-columns: 1fr; } .coupon-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 460px) { .metrics strong { font-size: 24px; } .metrics span { font-size: 10px; } .coupon-grid { grid-template-columns: 1fr; } }
</style>
