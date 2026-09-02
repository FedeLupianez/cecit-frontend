<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { accessToken } from "$lib/stores/authStore";
    import {
        Pencil,
        Plus,
        Trash2,
        Eye,
        Users,
        Store,
        Ticket,
        BadgePercent,
        XCircle,
        CheckCircle2,
        Tags,
    } from "lucide-svelte";

    type AccountRole = "USER" | "CECIT_ADMIN" | "PARTNER_ADMIN";

    interface Account {
        id_user: string;
        email: string | null;
        role: AccountRole;
        active: boolean;
        last_activity: string;
        name: string;
        lastname: string;
        dni: string;
    }

    interface Partner {
        id_partner: string;
        name: string;
        logo: string;
        directions: string[];
        active: boolean;
    }

    interface LocationItem {
        id_location: number;
        id_partner: string;
        direction: string;
    }

    interface Benefit {
        id_benefit: string;
        id_admin: string;
        id_partner: string;
        partner: string;
        type: string;
        categories: string[];
        payment_methods: string[];
        logo: string;
        directions: string[];
        start_date: string;
        end_date: string;
        image: string;
        title: string;
        description: string;
        coupons: number;
        max_coupons: number;
        max_per_user: number;
        status?: string;
    }

    interface BenefitType {
        id_type: number;
        name: string;
    }

    interface Category {
        id_category: number;
        name: string;
        icon_url: string;
        active: boolean;
    }

    interface Voucher {
        token: string;
        id_user: string;
        id_benefit: string;
        application_date: string;
        delivery_date: string;
        status: "PENDING" | "DELIVERED" | "EXPIRED" | "REJECTED";
    }

    interface VoucherLookup {
        token: string;
        status: "PENDING" | "DELIVERED" | "EXPIRED" | "REJECTED";
        title: string;
        image: string;
        partner: string;
        endDate: string;
        logo: string;
        user_name: string;
        user_dni: string;
        directions: string[];
        methods: string[];
    }

    type Tab = "usuarios" | "negocios" | "beneficios" | "vouchers" | "categorias";

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: "usuarios", label: "Usuarios", icon: Users },
        { id: "negocios", label: "Negocios", icon: Store },
        { id: "beneficios", label: "Beneficios", icon: BadgePercent },
        { id: "vouchers", label: "Vouchers", icon: Ticket },
        { id: "categorias", label: "Categorías", icon: Tags },
    ];

    let activeTab: Tab = $state("usuarios");

    let loadingGlobal = $state(true);
    let errorGlobal = $state("");
    let successGlobal = $state("");

    let accounts: Account[] = $state([]);
    let partners: Partner[] = $state([]);
    let benefits: Benefit[] = $state([]);
    let benefitTypes: BenefitType[] = $state([]);
    let vouchers: Voucher[] = $state([]);
    let categories: Category[] = $state([]);

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

    function setError(message: string) {
        errorGlobal = message;
        successGlobal = "";
    }

    function setSuccess(message: string) {
        successGlobal = message;
        errorGlobal = "";
    }

    const accountsById = $derived(
        new Map(accounts.map((account) => [account.id_user, account])),
    );
    const benefitsById = $derived(
        new Map(benefits.map((benefit) => [benefit.id_benefit, benefit])),
    );

    async function loadAll() {
        loadingGlobal = true;
        errorGlobal = "";
        try {
            const token = accessToken.getToken();
            if (!token) {
                setError("Tu sesión expiró. Volvé a iniciar sesión.");
                return;
            }
            const [accountsRes, partnersRes, benefitsRes, typesRes, vouchersRes, categoriesRes] =
                await Promise.all([
                    fetch("/api/accounts/all", {
                        headers: authHeaders(),
                        credentials: "include",
                    }),
                    fetch("/api/partners/all", {
                        headers: authHeaders(),
                        credentials: "include",
                    }),
                    fetch("/api/benefits/all"),
                    fetch("/api/benefit-types/all"),
                    fetch("/api/vouchers/all"),
                    fetch("/api/categories/all"),
                ]);
            if (accountsRes.status === 401 || accountsRes.status === 403) {
                setError("No tenés permiso para ver el panel de administrador.");
                return;
            }
            if (!accountsRes.ok || !partnersRes.ok || !benefitsRes.ok) {
                setError("No se pudieron cargar los datos del panel.");
                return;
            }
            accounts = await accountsRes.json();
            partners = await partnersRes.json();
            benefits = await benefitsRes.json();
            benefitTypes = typesRes.ok ? await typesRes.json() : [];
            vouchers = vouchersRes.ok ? await vouchersRes.json() : [];
            categories = categoriesRes.ok ? await categoriesRes.json() : [];
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "No se pudo cargar el panel.",
            );
        } finally {
            loadingGlobal = false;
        }
    }

    onMount(loadAll);

    /* ------------------------------------------------------------------ */
    /*  USUARIOS                                                           */
    /* ------------------------------------------------------------------ */

    let userFilter = $state("");
    let editingUser = $state<Record<string, "email" | "password" | null>>({});
    let emailInputs = $state<Record<string, string>>({});
    let passwordInputs = $state<Record<string, string>>({});
    let savingUser = $state("");
    let userErrors = $state<Record<string, string>>({});
    let userSuccess = $state<Record<string, string>>({});

    const filteredAccounts = $derived(
        userFilter.trim()
            ? accounts.filter((account) => {
                  const needle = userFilter.trim().toLowerCase();
                  return [
                      account.id_user,
                      account.email ?? "",
                      account.name,
                      account.lastname,
                      account.dni,
                  ]
                      .join(" ")
                      .toLowerCase()
                      .includes(needle);
              })
            : accounts,
    );

    function startEditEmail(account: Account) {
        if (editingUser[account.id_user]) return;
        emailInputs[account.id_user] = account.email ?? "";
        passwordInputs[account.id_user] = "";
        userErrors[account.id_user] = "";
        userSuccess[account.id_user] = "";
        editingUser[account.id_user] = "email";
    }

    function startEditPassword(account: Account) {
        if (editingUser[account.id_user]) return;
        emailInputs[account.id_user] = "";
        passwordInputs[account.id_user] = "";
        userErrors[account.id_user] = "";
        userSuccess[account.id_user] = "";
        editingUser[account.id_user] = "password";
    }

    function cancelEditUser(id: string) {
        editingUser[id] = null;
        userErrors[id] = "";
    }

    async function saveEmail(account: Account) {
        const new_email = (emailInputs[account.id_user] ?? "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email)) {
            userErrors[account.id_user] = "Ingresá un correo electrónico válido.";
            return;
        }
        if (new_email.toLowerCase() === (account.email ?? "").toLowerCase()) {
            editingUser[account.id_user] = null;
            return;
        }
        savingUser = account.id_user;
        userErrors[account.id_user] = "";
        userSuccess[account.id_user] = "";
        try {
            const response = await fetch("/api/accounts", {
                method: "PATCH",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_user: account.id_user, email: new_email }),
            });
            if (!response.ok) {
                userErrors[account.id_user] = await parseError(response);
                return;
            }
            const updated = await response.json();
            const index = accounts.findIndex(
                (a) => a.id_user === account.id_user,
            );
            if (index >= 0) accounts[index] = updated;
            editingUser[account.id_user] = null;
            userSuccess[account.id_user] = "Correo actualizado correctamente.";
            successGlobal = "";
        } catch (cause) {
            userErrors[account.id_user] =
                cause instanceof Error ? cause.message : "No se pudo actualizar.";
        } finally {
            savingUser = "";
        }
    }

    async function savePassword(account: Account) {
        const password = passwordInputs[account.id_user] ?? "";
        if (!password) {
            userErrors[account.id_user] = "Ingresá una nueva contraseña.";
            return;
        }
        if (password.length < 6) {
            userErrors[account.id_user] =
                "La contraseña debe tener al menos 6 caracteres.";
            return;
        }
        savingUser = account.id_user;
        userErrors[account.id_user] = "";
        userSuccess[account.id_user] = "";
        try {
            const response = await fetch("/api/accounts", {
                method: "PATCH",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_user: account.id_user, password }),
            });
            if (!response.ok) {
                userErrors[account.id_user] = await parseError(response);
                return;
            }
            editingUser[account.id_user] = null;
            userSuccess[account.id_user] = "Contraseña actualizada correctamente.";
        } catch (cause) {
            userErrors[account.id_user] =
                cause instanceof Error ? cause.message : "No se pudo actualizar.";
        } finally {
            savingUser = "";
        }
    }

    async function toggleActive(account: Account) {
        savingUser = account.id_user;
        userErrors[account.id_user] = "";
        try {
            const response = await fetch("/api/accounts", {
                method: "PATCH",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_user: account.id_user,
                    active: !account.active,
                }),
            });
            if (!response.ok) {
                userErrors[account.id_user] = await parseError(response);
                return;
            }
            const updated = await response.json();
            const index = accounts.findIndex(
                (a) => a.id_user === account.id_user,
            );
            if (index >= 0) accounts[index] = updated;
            userSuccess[account.id_user] = updated.active
                ? "Cuenta activada."
                : "Cuenta desactivada.";
        } catch (cause) {
            userErrors[account.id_user] =
                cause instanceof Error ? cause.message : "No se pudo actualizar.";
        } finally {
            savingUser = "";
        }
    }

    /* ------------------------------------------------------------------ */
    /*  NEGOCIOS                                                           */
    /* ------------------------------------------------------------------ */

    let editingPartner = $state("");
    let partnerNameInputs = $state<Record<string, string>>({});
    let partnerLogoInputs = $state<Record<string, string>>({});
    let partnerLocationInputs = $state<Record<string, string>>({});
    let locationsByPartner = $state<Record<string, LocationItem[]>>({});
    let locationsLoading = $state<Record<string, boolean>>({});
    let partnerBusy = $state<Record<string, boolean>>({});
    let partnerErrors = $state<Record<string, string>>({});
    let partnerSuccess = $state<Record<string, string>>({});

    let creatingPartner = $state(false);
    let newPartner = $state({
        partner_name: "",
        email: "",
        password: "",
        logo: "",
        directions: "",
    });
    let savingPartner = $state(false);
    let partnerCreateError = $state("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function ensureLocations(partnerId: string) {
        if (locationsByPartner[partnerId] || locationsLoading[partnerId]) return;
        locationsByPartner[partnerId] = [];
        locationsLoading[partnerId] = true;
        try {
            const response = await fetch(
                `/api/partners/locations?id_partner=${encodeURIComponent(partnerId)}`,
                { headers: authHeaders(), credentials: "include" },
            );
            locationsByPartner[partnerId] = response.ok
                ? await response.json()
                : [];
        } catch {
            locationsByPartner[partnerId] = [];
        } finally {
            locationsLoading[partnerId] = false;
        }
    }

    function openPartnerEdit(partner: Partner) {
        editingPartner = partner.id_partner;
        partnerNameInputs[partner.id_partner] = partner.name;
        partnerLogoInputs[partner.id_partner] = partner.logo;
        partnerLocationInputs[partner.id_partner] = "";
        partnerErrors[partner.id_partner] = "";
        partnerSuccess[partner.id_partner] = "";
        ensureLocations(partner.id_partner);
    }

    function closePartnerEdit() {
        editingPartner = "";
    }

    async function updatePartnerName(partner: Partner) {
        const new_name = partnerNameInputs[partner.id_partner]?.trim();
        if (!new_name) {
            partnerErrors[partner.id_partner] = "Ingresá un nombre.";
            return;
        }
        partnerBusy[partner.id_partner] = true;
        partnerErrors[partner.id_partner] = "";
        try {
            const response = await fetch("/api/partners/name", {
                method: "PATCH",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_partner: partner.id_partner, new_name }),
            });
            if (!response.ok) {
                partnerErrors[partner.id_partner] = await parseError(response);
                return;
            }
            const updated = await response.json();
            updatePartnerInList(updated);
            partnerSuccess[partner.id_partner] = "Nombre actualizado.";
        } catch (cause) {
            partnerErrors[partner.id_partner] =
                cause instanceof Error ? cause.message : "No se pudo actualizar.";
        } finally {
            partnerBusy[partner.id_partner] = false;
        }
    }

    async function updatePartnerLogo(partner: Partner) {
        const new_logo = partnerLogoInputs[partner.id_partner]?.trim();
        if (!new_logo) {
            partnerErrors[partner.id_partner] = "Ingresá la URL de la imagen.";
            return;
        }
        partnerBusy[partner.id_partner] = true;
        partnerErrors[partner.id_partner] = "";
        try {
            const response = await fetch("/api/partners/logo", {
                method: "PATCH",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_partner: partner.id_partner, new_logo }),
            });
            if (!response.ok) {
                partnerErrors[partner.id_partner] = await parseError(response);
                return;
            }
            const updated = await response.json();
            updatePartnerInList(updated);
            partnerSuccess[partner.id_partner] = "Imagen actualizada.";
        } catch (cause) {
            partnerErrors[partner.id_partner] =
                cause instanceof Error ? cause.message : "No se pudo actualizar.";
        } finally {
            partnerBusy[partner.id_partner] = false;
        }
    }

    function updatePartnerInList(updated: Partner) {
        const index = partners.findIndex(
            (p) => p.id_partner === updated.id_partner,
        );
        if (index >= 0) partners[index] = updated;
    }

    async function addPartnerLocation(partner: Partner) {
        const direction = partnerLocationInputs[partner.id_partner]?.trim();
        if (!direction) {
            partnerErrors[partner.id_partner] = "Ingresá una dirección.";
            return;
        }
        partnerBusy[partner.id_partner] = true;
        partnerErrors[partner.id_partner] = "";
        try {
            const response = await fetch("/api/partners/locations", {
                method: "POST",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_partner: partner.id_partner,
                    direction,
                }),
            });
            if (!response.ok) {
                partnerErrors[partner.id_partner] = await parseError(response);
                return;
            }
            const created = await response.json();
            locationsByPartner[partner.id_partner] = [
                ...(locationsByPartner[partner.id_partner] ?? []),
                created,
            ];
            partnerLocationInputs[partner.id_partner] = "";
        } catch (cause) {
            partnerErrors[partner.id_partner] =
                cause instanceof Error ? cause.message : "No se pudo agregar.";
        } finally {
            partnerBusy[partner.id_partner] = false;
        }
    }

    async function removePartnerLocation(partnerId: string, id_location: number) {
        partnerBusy[partnerId] = true;
        partnerErrors[partnerId] = "";
        try {
            const response = await fetch(
                `/api/partners/locations?id_location=${encodeURIComponent(String(id_location))}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                    credentials: "include",
                },
            );
            if (!response.ok) {
                partnerErrors[partnerId] = await parseError(response);
                return;
            }
            locationsByPartner[partnerId] = (
                locationsByPartner[partnerId] ?? []
            ).filter((location) => location.id_location !== id_location);
        } catch (cause) {
            partnerErrors[partnerId] =
                cause instanceof Error ? cause.message : "No se pudo quitar.";
        } finally {
            partnerBusy[partnerId] = false;
        }
    }

    async function deletePartner(partner: Partner) {
        if (!confirm(`¿Eliminar el negocio "${partner.name}"?`)) return;
        partnerBusy[partner.id_partner] = true;
        partnerErrors[partner.id_partner] = "";
        try {
            const response = await fetch(`/api/partners/${partner.id_partner}`, {
                method: "DELETE",
                headers: authHeaders(),
                credentials: "include",
            });
            if (!response.ok) {
                partnerErrors[partner.id_partner] = await parseError(response);
                return;
            }
            partners = partners.filter(
                (p) => p.id_partner !== partner.id_partner,
            );
            setSuccess("Negocio eliminado correctamente.");
        } catch (cause) {
            partnerErrors[partner.id_partner] =
                cause instanceof Error ? cause.message : "No se pudo eliminar.";
        } finally {
            partnerBusy[partner.id_partner] = false;
        }
    }

    async function createPartner() {
        const directions = newPartner.directions
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean);
        if (!newPartner.partner_name.trim()) {
            partnerCreateError = "Ingresá el nombre del negocio.";
            return;
        }
        if (!emailRegex.test(newPartner.email.trim())) {
            partnerCreateError = "Ingresá un correo electrónico válido.";
            return;
        }
        if (!newPartner.password) {
            partnerCreateError = "Ingresá una contraseña.";
            return;
        }
        if (!newPartner.logo.trim()) {
            partnerCreateError = "Ingresá la URL del logo.";
            return;
        }
        savingPartner = true;
        partnerCreateError = "";
        try {
            const response = await fetch("/api/partners", {
                method: "POST",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    partner_name: newPartner.partner_name.trim(),
                    email: newPartner.email.trim().toLowerCase(),
                    password: newPartner.password,
                    logo: newPartner.logo.trim(),
                    directions,
                }),
            });
            if (!response.ok) {
                partnerCreateError = await parseError(response);
                return;
            }
            creatingPartner = false;
            newPartner = {
                partner_name: "",
                email: "",
                password: "",
                logo: "",
                directions: "",
            };
            setSuccess("Negocio creado correctamente.");
            await loadAll();
        } catch (cause) {
            partnerCreateError =
                cause instanceof Error ? cause.message : "No se pudo crear.";
        } finally {
            savingPartner = false;
        }
    }

    /* ------------------------------------------------------------------ */
    /*  BENEFICIOS                                                         */
    /* ------------------------------------------------------------------ */

    let openingCreatingBenefit = $state(false);
    let newBenefit = $state({
        id_partner: "",
        id_type: "",
        title: "",
        description: "",
        image: "",
        start_date: "",
        end_date: "",
        max_coupons: "",
        max_per_user: "",
    });
    let savingBenefit = $state(false);
    let benefitCreateError = $state("");

    let editingBenefitId = $state("");
    let benefitDrafts = $state<Record<string, Partial<Benefit>>>({});
    let benefitBusy = $state("");
    let benefitErrors = $state<Record<string, string>>({});
    let benefitSuccess = $state<Record<string, string>>({});

    const today = $derived(new Date().toISOString().slice(0, 10));

    function startEditBenefit(benefit: Benefit) {
        editingBenefitId = benefit.id_benefit;
        benefitDrafts[benefit.id_benefit] = {
            title: benefit.title,
            description: benefit.description,
            image: benefit.image,
            start_date: benefit.start_date,
            end_date: benefit.end_date,
            max_coupons: benefit.max_coupons,
            max_per_user: benefit.max_per_user,
            status: benefit.status ?? "ACTIVE",
        };
        benefitErrors[benefit.id_benefit] = "";
        benefitSuccess[benefit.id_benefit] = "";
    }

    function cancelEditBenefit() {
        editingBenefitId = "";
    }

    async function saveBenefit(benefit: Benefit) {
        const draft = benefitDrafts[benefit.id_benefit];
        benefitBusy = benefit.id_benefit;
        benefitErrors[benefit.id_benefit] = "";
        try {
            const response = await fetch("/api/benefits", {
                method: "PATCH",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_benefit: benefit.id_benefit, ...draft }),
            });
            if (!response.ok) {
                benefitErrors[benefit.id_benefit] = await parseError(response);
                return;
            }
            const updated = await response.json();
            const index = benefits.findIndex(
                (b) => b.id_benefit === benefit.id_benefit,
            );
            if (index >= 0) benefits[index] = updated;
            editingBenefitId = "";
            benefitSuccess[benefit.id_benefit] = "Beneficio actualizado.";
        } catch (cause) {
            benefitErrors[benefit.id_benefit] =
                cause instanceof Error ? cause.message : "No se pudo actualizar.";
        } finally {
            benefitBusy = "";
        }
    }

    async function deleteBenefit(benefit: Benefit) {
        if (!confirm(`¿Eliminar el beneficio "${benefit.title}"?`)) return;
        benefitBusy = benefit.id_benefit;
        benefitErrors[benefit.id_benefit] = "";
        try {
            const response = await fetch("/api/benefits", {
                method: "DELETE",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_benefit: benefit.id_benefit }),
            });
            if (!response.ok) {
                benefitErrors[benefit.id_benefit] = await parseError(response);
                return;
            }
            benefits = benefits.filter(
                (b) => b.id_benefit !== benefit.id_benefit,
            );
            setSuccess("Beneficio eliminado correctamente.");
        } catch (cause) {
            benefitErrors[benefit.id_benefit] =
                cause instanceof Error ? cause.message : "No se pudo eliminar.";
        } finally {
            benefitBusy = "";
        }
    }

    async function createBenefit() {
        if (
            !newBenefit.title.trim() ||
            !newBenefit.id_partner ||
            !newBenefit.id_type
        ) {
            benefitCreateError =
                "Completá el título, el negocio y el tipo de beneficio.";
            return;
        }
        savingBenefit = true;
        benefitCreateError = "";
        try {
            const response = await fetch("/api/benefits", {
                method: "POST",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_admin: page.data.profile?.user_id ?? "",
                    id_partner: newBenefit.id_partner,
                    id_type: Number(newBenefit.id_type),
                    start_date: newBenefit.start_date || today,
                    end_date: newBenefit.end_date || today,
                    image: newBenefit.image,
                    title: newBenefit.title.trim(),
                    description: newBenefit.description.trim(),
                    coupons: 0,
                    max_coupons: Number(newBenefit.max_coupons) || 100,
                    max_per_user: Number(newBenefit.max_per_user) || 1,
                }),
            });
            if (!response.ok) {
                benefitCreateError = await parseError(response);
                return;
            }
            openingCreatingBenefit = false;
            newBenefit = {
                id_partner: "",
                id_type: "",
                title: "",
                description: "",
                image: "",
                start_date: "",
                end_date: "",
                max_coupons: "",
                max_per_user: "",
            };
            setSuccess("Beneficio creado correctamente.");
            await loadAll();
        } catch (cause) {
            benefitCreateError =
                cause instanceof Error ? cause.message : "No se pudo crear.";
        } finally {
            savingBenefit = false;
        }
    }

    /* ------------------------------------------------------------------ */
    /*  CATEGORÍAS                                                         */
    /* ------------------------------------------------------------------ */

    let categoryBusy = $state(0);
    let categoryErrors = $state<Record<number, string>>({});
    let categorySuccess = $state<Record<number, string>>({});

    async function toggleCategory(category: Category) {
        categoryBusy = category.id_category;
        categoryErrors[category.id_category] = "";
        categorySuccess[category.id_category] = "";
        try {
            const response = await fetch(
                `/api/categories/${category.id_category}`,
                {
                    method: "PATCH",
                    headers: {
                        ...authHeaders(),
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ active: !category.active }),
                },
            );
            if (!response.ok) {
                categoryErrors[category.id_category] = await parseError(response);
                return;
            }
            const updated = await response.json();
            const index = categories.findIndex(
                (c) => c.id_category === updated.id_category,
            );
            if (index >= 0) categories[index] = updated;
            categorySuccess[category.id_category] = updated.active
                ? "Categoría activada."
                : "Categoría desactivada.";
        } catch (cause) {
            categoryErrors[category.id_category] =
                cause instanceof Error ? cause.message : "No se pudo actualizar.";
        } finally {
            categoryBusy = 0;
        }
    }

    /* ------------------------------------------------------------------ */
    /*  VOUCHERS                                                           */
    /* ------------------------------------------------------------------ */

    let voucherFilter = $state("");
    let voucherStatus = $state("ALL");
    let voucherSearch = $state("");
    let searchedVoucher: VoucherLookup | undefined = $state();
    let voucherBusy = $state("");
    let voucherErrors = $state<Record<string, string>>({});

    let openingCreatingVoucher = $state(false);
    let newVoucher = $state({ id_user: "", id_benefit: "" });
    let savingVoucher = $state(false);
    let voucherCreateError = $state("");

    const filteredVouchers = $derived(
        vouchers
            .filter(
                (voucher) =>
                    voucherStatus === "ALL" || voucher.status === voucherStatus,
            )
            .filter((voucher) => {
                if (!voucherSearch.trim()) return true;
                const needle = voucherSearch.trim().toLowerCase();
                if (voucher.token.toLowerCase().includes(needle)) return true;
                if (voucher.id_user.toLowerCase().includes(needle)) return true;
                if (voucher.id_benefit.toLowerCase().includes(needle)) return true;
                const benefit = benefitsById.get(voucher.id_benefit);
                if (benefit?.title.toLowerCase().includes(needle)) return true;
                const account = accountsById.get(voucher.id_user);
                if (
                    account &&
                    `${account.name} ${account.lastname}`
                        .toLowerCase()
                        .includes(needle)
                )
                    return true;
                return false;
            }),
    );

    function voucherLabel(voucher: VoucherLookup) {
        return `${voucher.token} · ${voucher.partner}`;
    }

    async function searchVoucher() {
        const token = voucherFilter.trim();
        if (!token) {
            voucherErrors._search = "Ingresá el token del voucher.";
            return;
        }
        voucherBusy = "_search";
        voucherErrors._search = "";
        try {
            const response = await fetch(
                `/api/vouchers/bytoken?token=${encodeURIComponent(token)}`,
                { headers: authHeaders(), credentials: "include" },
            );
            if (!response.ok) {
                voucherErrors._search =
                    response.status === 404
                        ? "No se encontró ningún voucher con ese token."
                        : await parseError(response);
                searchedVoucher = undefined;
                return;
            }
            searchedVoucher = await response.json();
            voucherFilter = "";
        } catch (cause) {
            voucherErrors._search =
                cause instanceof Error
                    ? cause.message
                    : "No se pudo cargar el voucher.";
        } finally {
            voucherBusy = "";
        }
    }

    async function voucherAction(
        target: { token: string; status: string },
        action: "redeem" | "reject",
    ) {
        voucherBusy = target.token;
        voucherErrors[target.token] = "";
        try {
            const response = await fetch(
                `/api/vouchers?action=${action}&token=${encodeURIComponent(target.token)}`,
                {
                    method: "PATCH",
                    headers: authHeaders(),
                    credentials: "include",
                },
            );
            if (!response.ok) {
                voucherErrors[target.token] = await parseError(response);
                return;
            }
            const index = vouchers.findIndex(
                (v) => v.token === target.token,
            );
            if (index >= 0) {
                const current = vouchers[index];
                vouchers[index] = {
                    ...current,
                    status: action === "redeem" ? "DELIVERED" : "REJECTED",
                };
            }
            if (searchedVoucher?.token === target.token) {
                searchedVoucher = {
                    ...searchedVoucher,
                    status: action === "redeem" ? "DELIVERED" : "REJECTED",
                };
            }
            setSuccess(
                action === "redeem"
                    ? "Voucher canjeado correctamente."
                    : "Voucher rechazado correctamente.",
            );
        } catch (cause) {
            voucherErrors[target.token] =
                cause instanceof Error ? cause.message : "No se pudo realizar.";
        } finally {
            voucherBusy = "";
        }
    }

    async function deleteVoucher(voucher: Voucher) {
        if (!confirm(`¿Eliminar el voucher ${voucher.token}?`)) return;
        voucherBusy = voucher.token;
        voucherErrors[voucher.token] = "";
        try {
            const response = await fetch("/api/vouchers", {
                method: "DELETE",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    token: voucher.token,
                    id_user: voucher.id_user,
                }),
            });
            if (!response.ok) {
                voucherErrors[voucher.token] = await parseError(response);
                return;
            }
            vouchers = vouchers.filter((v) => v.token !== voucher.token);
            setSuccess("Voucher eliminado correctamente.");
        } catch (cause) {
            voucherErrors[voucher.token] =
                cause instanceof Error ? cause.message : "No se pudo eliminar.";
        } finally {
            voucherBusy = "";
        }
    }

    async function createVoucher() {
        if (!newVoucher.id_user || !newVoucher.id_benefit) {
            voucherCreateError = "Elegí un usuario y un beneficio.";
            return;
        }
        savingVoucher = true;
        voucherCreateError = "";
        try {
            const response = await fetch("/api/vouchers/create", {
                method: "POST",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_user: newVoucher.id_user,
                    id_benefit: newVoucher.id_benefit,
                }),
            });
            if (!response.ok) {
                voucherCreateError = await parseError(response);
                return;
            }
            const created = await response.json();
            vouchers = [...vouchers, created];
            openingCreatingVoucher = false;
            newVoucher = { id_user: "", id_benefit: "" };
            setSuccess("Voucher creado correctamente.");
        } catch (cause) {
            voucherCreateError =
                cause instanceof Error ? cause.message : "No se pudo crear.";
        } finally {
            savingVoucher = false;
        }
    }

    function formatDate(value: string) {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function formatLastActivity(value: string) {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

<svelte:head><title>Panel de administrador | CeCIT</title></svelte:head>

<section class="admin-panel">
    <div class="inner">
        <div class="intro-row">
            <div>
                <h1>Panel de Administrador</h1>
                <p>
                    Gestioná usuarios, negocios, beneficios y vouchers del
                    sistema CeCIT.
                </p>
            </div>
        </div>

        <nav class="tabs" aria-label="Secciones del panel">
            {#each tabs as tab (tab.id)}
                <button
                    type="button"
                    class:active={activeTab === tab.id}
                    onclick={() => (activeTab = tab.id)}
                >
                    {#if tab.icon}
                        {@const Icon = tab.icon}
                        <Icon size={16} />
                    {/if}
                    {tab.label}
                </button>
            {/each}
        </nav>

        {#if errorGlobal}
            <p class="state error" role="alert">{errorGlobal}</p>
        {/if}
        {#if successGlobal}
            <p class="state success" role="status">{successGlobal}</p>
        {/if}

        {#if loadingGlobal}
            <p class="state">Cargando información del panel...</p>
        {:else}
            {#if activeTab === "usuarios"}
                <section class="section">
                    <header class="section-head">
                        <div>
                            <h2>Usuarios</h2>
                            <p>
                                Visualizá las cuentas y modificá su correo o
                                contraseña.
                            </p>
                        </div>
                        <input
                            class="search"
                            type="search"
                            placeholder="Buscar por nombre, DNI o email…"
                            bind:value={userFilter}
                        />
                    </header>

                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Socio</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Última actividad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each filteredAccounts as account (account.id_user)}
                                    <tr>
                                        <td>
                                            <strong>{account.name} {account.lastname}</strong>
                                            <span class="sub"
                                                >{account.dni} · {account.id_user}</span
                                            >
                                        </td>
                                        <td>
                                            {#if editingUser[account.id_user] === "email"}
                                                <div class="inline-edit">
                                                    <input
                                                        type="email"
                                                        bind:value={emailInputs[account.id_user]}
                                                        onkeydown={(e) =>
                                                            e.key === "Enter" &&
                                                            saveEmail(account)}
                                                    />
                                                    <div class="edit-actions">
                                                        <button
                                                            class="save-btn"
                                                            type="button"
                                                            onclick={() =>
                                                                saveEmail(account)}
                                                            disabled={savingUser === account.id_user}
                                                        >Guardar</button>
                                                        <button
                                                            class="cancel-btn"
                                                            type="button"
                                                            onclick={() =>
                                                                cancelEditUser(account.id_user)}
                                                        >Cancelar</button>
                                                    </div>
                                                </div>
                                            {:else}
                                                <span class="mono">{account.email ?? "—"}</span>
                                            {/if}
                                        </td>
                                        <td>
                                            <span class="role-badge"
                                                >{account.role}</span
                                            >
                                        </td>
                                        <td>
                                            <button
                                                class="status-btn"
                                                class:on={account.active}
                                                type="button"
                                                onclick={() => toggleActive(account)}
                                                disabled={savingUser === account.id_user}
                                            >
                                                {account.active ? "ACTIVA" : "INACTIVA"}
                                            </button>
                                        </td>
                                        <td>
                                            <span class="mono">{formatLastActivity(account.last_activity)}</span>
                                        </td>
                                        <td>
                                            <div class="row-actions">
                                                {#if editingUser[account.id_user] === "password"}
                                                    <div class="inline-edit">
                                                        <input
                                                            type="password"
                                                            placeholder="Nueva contraseña"
                                                            bind:value={passwordInputs[account.id_user]}
                                                            onkeydown={(e) =>
                                                                e.key === "Enter" &&
                                                                savePassword(account)}
                                                        />
                                                        <div class="edit-actions">
                                                            <button
                                                                class="save-btn"
                                                                type="button"
                                                                onclick={() =>
                                                                    savePassword(account)}
                                                                disabled={savingUser === account.id_user}
                                                            >Guardar</button>
                                                            <button
                                                                class="cancel-btn"
                                                                type="button"
                                                                onclick={() =>
                                                                    cancelEditUser(account.id_user)}
                                                            >Cancelar</button>
                                                        </div>
                                                    </div>
                                                {:else if editingUser[account.id_user] !== "email"}
                                                    <button
                                                        class="ico-btn"
                                                        type="button"
                                                        title="Cambiar email"
                                                        onclick={() =>
                                                            startEditEmail(account)}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        class="ico-btn"
                                                        type="button"
                                                        title="Cambiar contraseña"
                                                        onclick={() =>
                                                            startEditPassword(account)}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                {/if}
                                            </div>
                                        </td>
                                    </tr>
                                    {#if userErrors[account.id_user] || userSuccess[account.id_user]}
                                        <tr class="msg-row">
                                            <td colspan="6">
                                                {#if userErrors[account.id_user]}
                                                    <p class="field-error" role="alert">
                                                        {userErrors[account.id_user]}
                                                    </p>
                                                {/if}
                                                {#if userSuccess[account.id_user]}
                                                    <p class="field-success" role="status">
                                                        {userSuccess[account.id_user]}
                                                    </p>
                                                {/if}
                                            </td>
                                        </tr>
                                    {/if}
                                {:else}
                                    <tr>
                                        <td colspan="6" class="empty-cell">
                                            No hay usuarios para mostrar.
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </section>

            {:else if activeTab === "negocios"}
                <section class="section">
                    <header class="section-head">
                        <div>
                            <h2>Negocios</h2>
                            <p>
                                Administrá los negocios asociados tal como un
                                negociante.
                            </p>
                        </div>
                        <button
                            class="add-btn"
                            type="button"
                            onclick={() => (creatingPartner = !creatingPartner)}
                        >
                            <Plus size={16} />
                            {creatingPartner ? "Cancelar" : "Nuevo negocio"}
                        </button>
                    </header>

                    {#if creatingPartner}
                        <form
                            class="create-form"
                            onsubmit={(e) => {
                                e.preventDefault();
                                createPartner();
                            }}
                        >
                            <h3>Nuevo negocio</h3>
                            <div class="form-grid">
                                <label>
                                    Nombre
                                    <input
                                        type="text"
                                        placeholder="Nombre del negocio"
                                        bind:value={newPartner.partner_name}
                                    />
                                </label>
                                <label>
                                    Email del admin
                                    <input
                                        type="email"
                                        placeholder="admin@negocio.com"
                                        bind:value={newPartner.email}
                                    />
                                </label>
                                <label>
                                    Contraseña del admin
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        bind:value={newPartner.password}
                                    />
                                </label>
                                <label>
                                    Logo (URL)
                                    <input
                                        type="url"
                                        placeholder="https://…"
                                        bind:value={newPartner.logo}
                                    />
                                </label>
                                <label class="full">
                                    Direcciones (separadas por coma)
                                    <input
                                        type="text"
                                        placeholder="Calle 1, Calle 2"
                                        bind:value={newPartner.directions}
                                    />
                                </label>
                            </div>
                            {#if partnerCreateError}
                                <p class="field-error" role="alert">
                                    {partnerCreateError}
                                </p>
                            {/if}
                            <div class="form-actions">
                                <button
                                    class="save-btn"
                                    type="submit"
                                    disabled={savingPartner}
                                >
                                    {savingPartner ? "Guardando…" : "Crear negocio"}
                                </button>
                            </div>
                        </form>
                    {/if}

                    <div class="cards-grid">
                        {#each partners as partner (partner.id_partner)}
                            <article class="data-card">
                                <div class="card-top">
                                    <img
                                        class="partner-logo"
                                        src={partner.logo}
                                        alt={`Logo de ${partner.name}`}
                                    />
                                    <div class="card-title">
                                        <h3>{partner.name}</h3>
                                        <span
                                            class="role-badge"
                                            class:off={!partner.active}
                                            >{partner.active
                                                ? "ACTIVO"
                                                : "INACTIVO"}</span
                                        >
                                    </div>
                                </div>

                                {#if editingPartner === partner.id_partner}
                                    <div class="edit-field">
                                        <label>Nombre</label>
                                        <div class="row">
                                            <input
                                                type="text"
                                                bind:value={partnerNameInputs[partner.id_partner]}
                                                onkeydown={(e) =>
                                                    e.key === "Enter" &&
                                                    updatePartnerName(partner)}
                                            />
                                            <button
                                                class="save-btn"
                                                type="button"
                                                onclick={() =>
                                                    updatePartnerName(partner)}
                                                disabled={partnerBusy[partner.id_partner]}
                                            >Guardar</button>
                                        </div>
                                    </div>
                                    <div class="edit-field">
                                        <label>Logo (URL)</label>
                                        <div class="row">
                                            <input
                                                type="url"
                                                bind:value={partnerLogoInputs[partner.id_partner]}
                                                onkeydown={(e) =>
                                                    e.key === "Enter" &&
                                                    updatePartnerLogo(partner)}
                                            />
                                            <button
                                                class="save-btn"
                                                type="button"
                                                onclick={() =>
                                                    updatePartnerLogo(partner)}
                                                disabled={partnerBusy[partner.id_partner]}
                                            >Guardar</button>
                                        </div>
                                    </div>

                                    <div class="edit-field">
                                        <label>Ubicaciones</label>
                                        {#if locationsLoading[partner.id_partner]}
                                            <p class="muted">Cargando…</p>
                                        {:else}
                                            <ul class="locs-list">
                                                {#each (locationsByPartner[partner.id_partner] ?? []) as location (location.id_location)}
                                                    <li class="loc-item">
                                                        <span>{location.direction}</span>
                                                        <button
                                                            class="remove-btn"
                                                            type="button"
                                                            aria-label={`Quitar ${location.direction}`}
                                                            onclick={() =>
                                                                removePartnerLocation(
                                                                    partner.id_partner,
                                                                    location.id_location,
                                                                )}
                                                            disabled={partnerBusy[partner.id_partner] !== undefined}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </li>
                                                {:else}
                                                    <li class="loc-empty">
                                                        Sin ubicaciones registradas.
                                                    </li>
                                                {/each}
                                            </ul>
                                            <div class="row">
                                                <input
                                                    type="text"
                                                    placeholder="Nueva dirección"
                                                    bind:value={partnerLocationInputs[partner.id_partner]}
                                                    onkeydown={(e) =>
                                                        e.key === "Enter" &&
                                                        addPartnerLocation(partner)}
                                                />
                                                <button
                                                    class="add-btn"
                                                    type="button"
                                                    onclick={() =>
                                                        addPartnerLocation(partner)}
                                                    disabled={partnerBusy[partner.id_partner]}
                                                >Agregar</button>
                                            </div>
                                        {/if}
                                    </div>

                                    {#if partnerErrors[partner.id_partner]}
                                        <p class="field-error" role="alert">
                                            {partnerErrors[partner.id_partner]}
                                        </p>
                                    {/if}
                                    {#if partnerSuccess[partner.id_partner]}
                                        <p class="field-success" role="status">
                                            {partnerSuccess[partner.id_partner]}
                                        </p>
                                    {/if}
                                {:else}
                                    <p class="directions">
                                        {partner.directions.length
                                            ? partner.directions.join(" · ")
                                            : "Sin ubicaciones registradas."}
                                    </p>
                                {/if}

                                <div class="card-actions">
                                    {#if editingPartner === partner.id_partner}
                                        <button
                                            class="cancel-btn"
                                            type="button"
                                            onclick={closePartnerEdit}
                                        >Terminar</button>
                                    {:else}
                                        <button
                                            class="edit-btn"
                                            type="button"
                                            onclick={() => openPartnerEdit(partner)}
                                        >
                                            <Pencil size={13} />
                                            Editar
                                        </button>
                                    {/if}
                                    <button
                                        class="danger-btn"
                                        type="button"
                                        onclick={() => deletePartner(partner)}
                                        disabled={partnerBusy[partner.id_partner] !== undefined}
                                    >
                                        <Trash2 size={14} />
                                        Eliminar
                                    </button>
                                </div>
                            </article>
                        {:else}
                            <p class="empty">No hay negocios para mostrar.</p>
                        {/each}
                    </div>
                </section>

            {:else if activeTab === "beneficios"}
                <section class="section">
                    <header class="section-head">
                        <div>
                            <h2>Beneficios</h2>
                            <p>
                                Creá, editá o eliminá los beneficios publicados.
                            </p>
                        </div>
                        <button
                            class="add-btn"
                            type="button"
                            onclick={() =>
                                (openingCreatingBenefit =
                                    !openingCreatingBenefit)}
                        >
                            <Plus size={16} />
                            {openingCreatingBenefit
                                ? "Cancelar"
                                : "Nuevo beneficio"}
                        </button>
                    </header>

                    {#if openingCreatingBenefit}
                        <form
                            class="create-form"
                            onsubmit={(e) => {
                                e.preventDefault();
                                createBenefit();
                            }}
                        >
                            <h3>Nuevo beneficio</h3>
                            <div class="form-grid">
                                <label>
                                    Negocio
                                    <select bind:value={newBenefit.id_partner}>
                                        <option value="">Seleccionar…</option>
                                        {#each partners as partner (partner.id_partner)}
                                            <option value={partner.id_partner}>
                                                {partner.name}
                                            </option>
                                        {/each}
                                    </select>
                                </label>
                                <label>
                                    Tipo
                                    <select bind:value={newBenefit.id_type}>
                                        <option value="">Seleccionar…</option>
                                        {#each benefitTypes as type (type.id_type)}
                                            <option value={type.id_type}>
                                                {type.name}
                                            </option>
                                        {/each}
                                    </select>
                                </label>
                                <label>
                                    Título
                                    <input
                                        type="text"
                                        bind:value={newBenefit.title}
                                    />
                                </label>
                                <label>
                                    Imagen (URL)
                                    <input
                                        type="url"
                                        bind:value={newBenefit.image}
                                        placeholder="https://…"
                                    />
                                </label>
                                <label>
                                    Inicio
                                    <input
                                        type="date"
                                        bind:value={newBenefit.start_date}
                                    />
                                </label>
                                <label>
                                    Fin
                                    <input
                                        type="date"
                                        bind:value={newBenefit.end_date}
                                    />
                                </label>
                                <label>
                                    Cupones máximos
                                    <input
                                        type="number"
                                        min="1"
                                        bind:value={newBenefit.max_coupons}
                                    />
                                </label>
                                <label>
                                    Máximo por usuario
                                    <input
                                        type="number"
                                        min="1"
                                        bind:value={newBenefit.max_per_user}
                                    />
                                </label>
                                <label class="full">
                                    Descripción
                                    <textarea
                                        rows="3"
                                        bind:value={newBenefit.description}
                                    ></textarea>
                                </label>
                            </div>
                            {#if benefitCreateError}
                                <p class="field-error" role="alert">
                                    {benefitCreateError}
                                </p>
                            {/if}
                            <div class="form-actions">
                                <button
                                    class="save-btn"
                                    type="submit"
                                    disabled={savingBenefit}
                                >
                                    {savingBenefit
                                        ? "Guardando…"
                                        : "Crear beneficio"}
                                </button>
                            </div>
                        </form>
                    {/if}

                    <div class="cards-grid">
                        {#each benefits as benefit (benefit.id_benefit)}
                            <article class="data-card">
                                <div class="card-top">
                                    <img
                                        class="benefit-img"
                                        src={benefit.image}
                                        alt={benefit.title}
                                    />
                                    <div class="card-title">
                                        <h3>{benefit.title}</h3>
                                        <span class="sub"
                                            >{benefit.partner}</span
                                        >
                                    </div>
                                </div>

                                {#if editingBenefitId === benefit.id_benefit}
                                    <div class="edit-field">
                                        <label>Título</label>
                                        <input
                                            type="text"
                                            bind:value={benefitDrafts[benefit.id_benefit].title}
                                        />
                                    </div>
                                    <div class="edit-field">
                                        <label>Descripción</label>
                                        <textarea
                                            rows="2"
                                            bind:value={benefitDrafts[benefit.id_benefit].description}
                                        ></textarea>
                                    </div>
                                    <div class="edit-field">
                                        <label>Imagen (URL)</label>
                                        <input
                                            type="url"
                                            bind:value={benefitDrafts[benefit.id_benefit].image}
                                        />
                                    </div>
                                    <div class="edit-field row-2">
                                        <label>
                                            Inicio
                                            <input
                                                type="date"
                                                bind:value={benefitDrafts[benefit.id_benefit].start_date}
                                            />
                                        </label>
                                        <label>
                                            Fin
                                            <input
                                                type="date"
                                                bind:value={benefitDrafts[benefit.id_benefit].end_date}
                                            />
                                        </label>
                                    </div>
                                    <div class="edit-field row-2">
                                        <label>
                                            Cupones máximos
                                            <input
                                                type="number"
                                                min="1"
                                                bind:value={benefitDrafts[benefit.id_benefit].max_coupons}
                                            />
                                        </label>
                                        <label>
                                            Máx. por usuario
                                            <input
                                                type="number"
                                                min="1"
                                                bind:value={benefitDrafts[benefit.id_benefit].max_per_user}
                                            />
                                        </label>
                                    </div>
                                    <div class="edit-field">
                                        <label>Estado</label>
                                        <select
                                            bind:value={benefitDrafts[benefit.id_benefit].status}
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                            <option value="PENDING">PENDING</option>
                                        </select>
                                    </div>
                                {:else}
                                    <p class="desc">{benefit.description}</p>
                                    <p class="sub">
                                        {benefit.type} · {benefit.coupons}/
                                        {benefit.max_coupons} canjeados
                                    </p>
                                {/if}

                                {#if benefitErrors[benefit.id_benefit]}
                                    <p class="field-error" role="alert">
                                        {benefitErrors[benefit.id_benefit]}
                                    </p>
                                {/if}
                                {#if benefitSuccess[benefit.id_benefit]}
                                    <p class="field-success" role="status">
                                        {benefitSuccess[benefit.id_benefit]}
                                    </p>
                                {/if}

                                <div class="card-actions">
                                    {#if editingBenefitId === benefit.id_benefit}
                                        <button
                                            class="save-btn"
                                            type="button"
                                            onclick={() => saveBenefit(benefit)}
                                            disabled={benefitBusy === benefit.id_benefit}
                                        >Guardar</button>
                                        <button
                                            class="cancel-btn"
                                            type="button"
                                            onclick={cancelEditBenefit}
                                        >Cancelar</button>
                                    {:else}
                                        <button
                                            class="edit-btn"
                                            type="button"
                                            onclick={() =>
                                                startEditBenefit(benefit)}
                                        >
                                            <Pencil size={13} />
                                            Editar
                                        </button>
                                    {/if}
                                    <button
                                        class="danger-btn"
                                        type="button"
                                        onclick={() => deleteBenefit(benefit)}
                                        disabled={benefitBusy === benefit.id_benefit}
                                    >
                                        <Trash2 size={14} />
                                        Eliminar
                                    </button>
                                </div>
                            </article>
                        {:else}
                            <p class="empty">No hay beneficios para mostrar.</p>
                        {/each}
                    </div>
                </section>

            {:else if activeTab === "categorias"}
                <section class="section">
                    <header class="section-head">
                        <div>
                            <h2>Categorías</h2>
                            <p>
                                Activá o desactivá las categorías de cupones.
                            </p>
                        </div>
                    </header>

                    {#if categories.length === 0}
                        <p class="empty">No hay categorías para mostrar.</p>
                    {:else}
                        <div class="table-wrap">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Categoría</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each categories as category (category.id_category)}
                                        <tr>
                                            <td>
                                                <strong>{category.name}</strong>
                                            </td>
                                            <td>
                                                <button
                                                    class="status-btn"
                                                    class:on={category.active}
                                                    type="button"
                                                    onclick={() =>
                                                        toggleCategory(category)}
                                                    disabled={categoryBusy ===
                                                        category.id_category}
                                                >
                                                    {category.active
                                                        ? "ACTIVA"
                                                        : "INACTIVA"}
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    class="ico-btn"
                                                    class:ok={!category.active}
                                                    type="button"
                                                    title={
                                                        category.active
                                                            ? "Desactivar"
                                                            : "Activar"
                                                    }
                                                    onclick={() =>
                                                        toggleCategory(category)}
                                                    disabled={categoryBusy ===
                                                        category.id_category}
                                                >
                                                    {#if category.active}
                                                        <XCircle size={15} />
                                                    {:else}
                                                        <CheckCircle2 size={15} />
                                                    {/if}
                                                </button>
                                            </td>
                                        </tr>
                                        {#if categoryErrors[category.id_category] || categorySuccess[category.id_category]}
                                            <tr class="msg-row">
                                                <td colspan="3">
                                                    {#if categoryErrors[category.id_category]}
                                                        <p class="field-error" role="alert">
                                                            {categoryErrors[category.id_category]}
                                                        </p>
                                                    {/if}
                                                    {#if categorySuccess[category.id_category]}
                                                        <p class="field-success" role="status">
                                                            {categorySuccess[category.id_category]}
                                                        </p>
                                                    {/if}
                                                </td>
                                            </tr>
                                        {/if}
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </section>

            {:else if activeTab === "vouchers"}
                <section class="section">
                    <header class="section-head">
                        <div>
                            <h2>Vouchers</h2>
                            <p>
                                Consultá, canjeá, rechazá o creá vouchers.
                            </p>
                        </div>
                        <div class="head-actions">
                            <select bind:value={voucherStatus}>
                                <option value="ALL">Todos los estados</option>
                                <option value="PENDING">PENDING</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="EXPIRED">EXPIRED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                            <button
                                class="add-btn"
                                type="button"
                                onclick={() =>
                                    (openingCreatingVoucher =
                                        !openingCreatingVoucher)}
                            >
                                <Plus size={16} />
                                {openingCreatingVoucher
                                    ? "Cancelar"
                                    : "Nuevo voucher"}
                            </button>
                        </div>
                    </header>

                    {#if openingCreatingVoucher}
                        <form
                            class="create-form"
                            onsubmit={(e) => {
                                e.preventDefault();
                                createVoucher();
                            }}
                        >
                            <h3>Nuevo voucher</h3>
                            <div class="form-grid">
                                <label>
                                    Usuario
                                    <select bind:value={newVoucher.id_user}>
                                        <option value="">Seleccionar…</option>
                                        {#each accounts as account (account.id_user)}
                                            <option value={account.id_user}>
                                                {account.name} {account.lastname}
                                                {account.dni
                                                    ? `· ${account.dni}`
                                                    : ""}
                                            </option>
                                        {/each}
                                    </select>
                                </label>
                                <label>
                                    Beneficio
                                    <select bind:value={newVoucher.id_benefit}>
                                        <option value="">Seleccionar…</option>
                                        {#each benefits as benefit (benefit.id_benefit)}
                                            <option value={benefit.id_benefit}>
                                                {benefit.title} · {benefit.partner}
                                            </option>
                                        {/each}
                                    </select>
                                </label>
                            </div>
                            {#if voucherCreateError}
                                <p class="field-error" role="alert">
                                    {voucherCreateError}
                                </p>
                            {/if}
                            <div class="form-actions">
                                <button
                                    class="save-btn"
                                    type="submit"
                                    disabled={savingVoucher}
                                >
                                    {savingVoucher ? "Guardando…" : "Crear voucher"}
                                </button>
                            </div>
                        </form>
                    {/if}

                    <div class="search-box search-voucher">
                        <input
                            type="text"
                            placeholder="Buscar por token, socio o beneficio…"
                            bind:value={voucherSearch}
                        />
                    </div>

                    <div class="lookup-box">
                        <label for="voucherLookupInput">
                            Consultar voucher por token
                        </label>
                        <div class="lookup-row">
                            <input
                                id="voucherLookupInput"
                                type="text"
                                placeholder="Ingresá el token…"
                                bind:value={voucherFilter}
                                onkeydown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        searchVoucher();
                                    }
                                }}
                            />
                            <button
                                class="search-btn"
                                type="button"
                                onclick={searchVoucher}
                                disabled={voucherBusy === "_search"}
                            >
                                {voucherBusy === "_search"
                                    ? "Buscando…"
                                    : "Buscar"}
                            </button>
                        </div>
                    </div>

                    {#if voucherErrors._search}
                        <p class="field-error" role="alert">
                            {voucherErrors._search}
                        </p>
                    {/if}

                    {#if searchedVoucher}
                        <div class="voucher-lookup">
                            <h3>Voucher {searchedVoucher.token}</h3>
                            <p class="sub">{voucherLabel(searchedVoucher)}</p>
                            <dl class="lookup-grid">
                                <div>
                                    <dt>BENEFICIO</dt>
                                    <dd>{searchedVoucher.title}</dd>
                                </div>
                                <div>
                                    <dt>NEGOCIO</dt>
                                    <dd>{searchedVoucher.partner}</dd>
                                </div>
                                <div>
                                    <dt>SOCIO</dt>
                                    <dd>
                                        {searchedVoucher.user_name}
                                        {searchedVoucher.user_dni
                                            ? `(${searchedVoucher.user_dni})`
                                            : ""}
                                    </dd>
                                </div>
                                <div>
                                    <dt>VIGENTE HASTA</dt>
                                    <dd>{formatDate(searchedVoucher.endDate)}</dd>
                                </div>
                            </dl>
                            <div class="state-bar">
                                <span class="status-chip" class:resolved={searchedVoucher.status !== "PENDING"}>
                                    {searchedVoucher.status}
                                </span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button
                                class="success-btn"
                                type="button"
                                onclick={() => {
                                    if (searchedVoucher)
                                        voucherAction(searchedVoucher, "redeem");
                                }}
                                disabled={!searchedVoucher || searchedVoucher.status !== "PENDING" || voucherBusy === searchedVoucher.token}
                            >
                                <CheckCircle2 size={14} />
                                Canjear
                            </button>
                            <button
                                class="danger-btn"
                                type="button"
                                onclick={() => {
                                    if (searchedVoucher)
                                        voucherAction(searchedVoucher, "reject");
                                }}
                                disabled={!searchedVoucher || searchedVoucher.status !== "PENDING" || voucherBusy === searchedVoucher.token}
                            >
                                <XCircle size={14} />
                                Rechazar
                            </button>
                        </div>
                    {/if}

                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Token</th>
                                    <th>Socio</th>
                                    <th>Beneficio</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each filteredVouchers as voucher (voucher.token)}
                                    <tr>
                                        <td>{formatDate(voucher.application_date)}</td>
                                        <td class="mono token">{voucher.token}</td>
                                        <td>
                                            {(() => {
                                                const account = accountsById.get(voucher.id_user);
                                                return account
                                                    ? `${account.name} ${account.lastname}`
                                                    : voucher.id_user;
                                            })()}
                                        </td>
                                        <td>
                                            {benefitsById.get(voucher.id_benefit)?.title ?? voucher.id_benefit}
                                        </td>
                                        <td>
                                            <span
                                                class="status-btn"
                                                class:on={voucher.status === "PENDING" || voucher.status === "DELIVERED"}
                                            >
                                                {voucher.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="row-actions">
                                                <button
                                                    class="ico-btn ok"
                                                    type="button"
                                                    title="Canjear"
                                                    onclick={() =>
                                                        voucherAction(voucher, "redeem")}
                                                    disabled={voucher.status !== "PENDING" || voucherBusy === voucher.token}
                                                >
                                                    <CheckCircle2 size={15} />
                                                </button>
                                                <button
                                                    class="ico-btn bad"
                                                    type="button"
                                                    title="Rechazar"
                                                    onclick={() =>
                                                        voucherAction(voucher, "reject")}
                                                    disabled={voucher.status !== "PENDING" || voucherBusy === voucher.token}
                                                >
                                                    <XCircle size={15} />
                                                </button>
                                                <button
                                                    class="ico-btn"
                                                    type="button"
                                                    title="Eliminar"
                                                    onclick={() =>
                                                        deleteVoucher(voucher)}
                                                    disabled={voucherBusy === voucher.token}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {#if voucherErrors[voucher.token]}
                                        <tr class="msg-row">
                                            <td colspan="6">
                                                <p class="field-error" role="alert">
                                                    {voucherErrors[voucher.token]}
                                                </p>
                                            </td>
                                        </tr>
                                    {/if}
                                {:else}
                                    <tr>
                                        <td colspan="6" class="empty-cell">
                                            No hay vouchers para mostrar.
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </section>
            {/if}
        {/if}
    </div>
</section>

<style>
    .admin-panel {
        min-height: 70vh;
        padding: 44px 24px 88px;
        background: #f4f6fb;
        color: #1a1f36;
    }
    .inner {
        width: min(100%, 1240px);
        margin: 0 auto;
    }
    .intro-row > div {
        max-width: 640px;
    }
    h1 {
        margin: 0;
        font-size: 30px;
        color: #151535;
    }
    .intro-row > div > p {
        margin: 6px 0 0;
        font-size: 17px;
        line-height: 1.3;
        color: #6b7280;
    }

    .tabs {
        display: flex;
        gap: 10px;
        margin: 26px 0 24px;
        flex-wrap: wrap;
    }
    .tabs button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 18px;
        border: 1px solid #cdd3e2;
        border-radius: 999px;
        background: #fff;
        color: #1a1f36;
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
    }
    .tabs button:hover {
        border-color: var(--primary-blue);
        color: var(--primary-blue);
    }
    .tabs button.active {
        border-color: var(--primary-blue);
        background: var(--primary-blue);
        color: #fff;
    }

    .section {
        border: 1px solid #e2e5ef;
        border-radius: 16px;
        background: #fff;
        padding: 24px;
        box-shadow: 0 10px 24px rgb(20 24 60 / 6%);
    }
    .section-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 18px;
        flex-wrap: wrap;
    }
    .section-head h2 {
        margin: 0;
        color: var(--primary-blue);
        font-size: 21px;
    }
    .section-head p {
        margin: 6px 0 0;
        color: #6b7280;
        font-size: 14px;
    }
    .head-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    .state {
        margin: 0 0 18px;
        padding: 18px 22px;
        border: 1px solid #aaa;
        border-radius: 8px;
    }
    .error {
        color: #a31818;
    }
    .success {
        color: #137333;
    }
    .empty,
    .muted {
        color: #6b7280;
    }

    .search {
        min-width: 240px;
        padding: 10px 13px;
        border: 1px solid #cdd3e2;
        border-radius: 9px;
        font: inherit;
        font-size: 14px;
    }
    .search:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
        outline: 2px solid var(--primary-blue);
        outline-offset: 1px;
    }

    .table-wrap {
        overflow-x: auto;
        border: 1px solid #e7e9f2;
        border-radius: 12px;
    }
    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }
    .data-table th {
        text-align: left;
        padding: 12px 14px;
        background: #eef0f7;
        color: #4b5468;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        white-space: nowrap;
    }
    .data-table td {
        padding: 12px 14px;
        border-top: 1px solid #eef0f6;
        vertical-align: middle;
    }
    .data-table tbody tr:hover {
        background: #fafbfe;
    }
    .sub {
        display: block;
        margin-top: 3px;
        color: #8a8d95;
        font-size: 12px;
    }
    .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 13px;
    }
    .token {
        letter-spacing: 0.25em;
        font-weight: 700;
    }
    .empty-cell {
        text-align: center;
        color: #8a8d95;
        padding: 30px;
    }
    .msg-row td {
        border-top: 0;
    }

    .role-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        background: #eef0f7;
        color: #4b5468;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.4px;
    }
    .role-badge.off {
        background: #fbeaea;
        color: #a31818;
    }

    .status-btn {
        padding: 5px 11px;
        border: 1px solid #b8bcc9;
        border-radius: 999px;
        background: #fff;
        color: #6b7280;
        font: inherit;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.4px;
        cursor: pointer;
    }
    .status-btn.on {
        border-color: #bfdfc9;
        background: #effaf1;
        color: #137333;
    }
    .status-btn:disabled {
        cursor: progress;
        opacity: 0.6;
    }

    .row-actions {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
    }
    .ico-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #fff;
        color: #4b5468;
        cursor: pointer;
    }
    .ico-btn:hover {
        background: #f3f4f6;
    }
    .ico-btn.ok:hover {
        border-color: #137333;
        color: #137333;
    }
    .ico-btn.bad:hover {
        border-color: #a31818;
        color: #a31818;
    }
    .ico-btn:disabled {
        opacity: 0.4;
        cursor: default;
    }

    .inline-edit {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 300px;
    }
    .inline-edit input {
        padding: 8px 10px;
        border: 1px solid #cdd3e2;
        border-radius: 8px;
        font: inherit;
        font-size: 14px;
    }
    .edit-actions {
        display: flex;
        gap: 8px;
    }

    .save-btn,
    .cancel-btn,
    .edit-btn,
    .add-btn,
    .danger-btn,
    .success-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 15px;
        border-radius: 999px;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
    }
    .save-btn,
    .success-btn {
        border: 1px solid #137333;
        background: #137333;
        color: #fff;
    }
    .save-btn:disabled,
    .success-btn:disabled {
        cursor: progress;
        opacity: 0.7;
    }
    .cancel-btn,
    .edit-btn {
        border: 1px solid #cdd3e2;
        background: #fff;
        color: #374151;
    }
    .cancel-btn:hover,
    .edit-btn:hover {
        background: #f3f4f6;
    }
    .add-btn {
        border: 1px solid var(--primary-blue);
        background: var(--primary-blue);
        color: #fff;
    }
    .add-btn:hover {
        background: #26266f;
    }
    .danger-btn {
        border: 1px solid #a31818;
        background: #fff;
        color: #a31818;
    }
    .danger-btn:hover {
        background: #fdf0f0;
    }
    .danger-btn:disabled {
        opacity: 0.5;
        cursor: default;
    }

    .field-error {
        margin: 8px 0 0;
        color: #a31818;
        font-size: 13px;
        font-weight: 600;
    }
    .field-success {
        margin: 8px 0 0;
        color: #137333;
        font-size: 13px;
        font-weight: 600;
    }

    .create-form {
        margin-bottom: 22px;
        padding: 18px;
        border: 1px solid #dfe3ee;
        border-radius: 12px;
        background: #fafbfe;
    }
    .create-form h3 {
        margin: 0 0 14px;
        color: #151535;
        font-size: 17px;
    }
    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 14px;
    }
    .form-grid .full {
        grid-column: 1 / -1;
    }
    .form-grid label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        font-weight: 700;
        color: #4b5468;
    }
    .form-grid input,
    .form-grid select,
    .form-grid textarea,
    .edit-field input,
    .edit-field select,
    .edit-field textarea {
        padding: 9px 11px;
        border: 1px solid #cdd3e2;
        border-radius: 8px;
        background: #fff;
        font: inherit;
        font-size: 14px;
        resize: vertical;
    }
    .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 14px;
    }
    .form-actions .save-btn {
        padding: 10px 20px;
    }

    .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 18px;
    }
    .data-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px;
        border: 1px solid #e2e5ef;
        border-radius: 12px;
        background: #fff;
    }
    .card-top {
        display: flex;
        align-items: center;
        gap: 14px;
    }
    .partner-logo,
    .benefit-img {
        width: 74px;
        height: 74px;
        border-radius: 8px;
        object-fit: cover;
        background: #eee;
        flex-shrink: 0;
    }
    .card-title {
        min-width: 0;
    }
    .card-title h3 {
        margin: 0 0 6px;
        font-size: 16px;
        line-height: 1.25;
        overflow-wrap: anywhere;
    }
    .directions,
    .desc {
        margin: 0;
        color: #4b5468;
        font-size: 13px;
        line-height: 1.5;
        overflow-wrap: anywhere;
    }
    .card-actions {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-top: auto;
        flex-wrap: wrap;
    }

    .edit-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .edit-field > label {
        font-size: 12px;
        font-weight: 800;
        color: #4b5468;
        letter-spacing: 0.3px;
    }
    .edit-field .row {
        display: flex;
        gap: 8px;
    }
    .edit-field .row input {
        flex: 1;
        min-width: 0;
    }
    .edit-field.row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }
    .edit-field.row-2 label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12px;
        font-weight: 800;
        color: #4b5468;
    }

    .locs-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 7px;
    }
    .loc-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px;
        border: 1px solid #dfe3ee;
        border-radius: 8px;
        font-size: 13px;
    }
    .loc-empty {
        padding: 10px;
        border: 1px dashed #cdd3e2;
        border-radius: 8px;
        color: #8a8d95;
        font-size: 13px;
    }
    .remove-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: 1px solid #e0c9c9;
        border-radius: 7px;
        background: transparent;
        color: #a31818;
        cursor: pointer;
        flex-shrink: 0;
    }
    .remove-btn:hover {
        background: #fdf0f0;
    }
    .remove-btn:disabled {
        opacity: 0.5;
        cursor: default;
    }

    .search-voucher {
        margin: 0 0 14px;
    }
    .search-box input {
        width: 100%;
        padding: 10px 13px;
        border: 1px solid #cdd3e2;
        border-radius: 9px;
        font: inherit;
        font-size: 14px;
    }

    .lookup-box {
        margin-bottom: 14px;
        padding: 14px 16px;
        border: 1px dashed #cdd3e2;
        border-radius: 12px;
        background: #eef1fa;
    }
    .lookup-box label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 800;
        color: #4b5468;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }
    .lookup-row {
        display: flex;
        gap: 10px;
    }
    .lookup-row input {
        flex: 1;
        padding: 10px 13px;
        border: 1px solid #cdd3e2;
        border-radius: 9px;
        font: inherit;
        font-size: 14px;
    }
    .search-btn {
        padding: 10px 18px;
        border: none;
        border-radius: 9px;
        background: var(--primary-blue);
        color: #fff;
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
    }
    .search-btn:disabled {
        opacity: 0.55;
        cursor: default;
    }

    .voucher-lookup {
        margin: 4px 0 14px;
        padding: 18px;
        border: 1px solid #cdd3e2;
        border-radius: 12px;
        background: #fafbfe;
    }
    .voucher-lookup h3 {
        margin: 0 0 4px;
        font-size: 17px;
    }
    .lookup-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 22px;
        margin: 14px 0 0;
    }
    .lookup-grid dt {
        color: #8a8d95;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.4px;
    }
    .lookup-grid dd {
        margin: 3px 0 0;
        font-size: 14px;
        overflow-wrap: anywhere;
    }
    .state-bar {
        margin-top: 12px;
    }
    .status-chip {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 999px;
        background: #2ecc71;
        color: #fff;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.4px;
    }
    .status-chip.resolved {
        background: #8a8d95;
    }

    @media (max-width: 720px) {
        .admin-panel {
            padding: 30px 16px 64px;
        }
        .section {
            padding: 16px;
        }
        .cards-grid {
            grid-template-columns: 1fr;
        }
        .lookup-grid {
            grid-template-columns: 1fr;
        }
        .edit-field.row-2 {
            grid-template-columns: 1fr;
        }
    }
</style>