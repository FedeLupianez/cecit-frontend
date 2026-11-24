import { apiFetch } from "$lib/api-client";

export interface Partner {
    id_partner: string;
    name: string;
    logo: string;
    directions: string[];
    active: boolean;
}

let partners: Partner[] = $state([]);
let loadPromise: Promise<void> | null = null;

export async function loadPartners() {
    if (partners.length) return;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
        try {
            const res = await apiFetch("partners/all");
            if (res.ok) {
                partners = await res.json();
            }
        } catch {
            /* noop */
        } finally {
            loadPromise = null;
        }
    })();
    return loadPromise;
}

export function getPartners() {
    return partners;
}

export function resetPartners() {
    partners = [];
    loadPromise = null;
}