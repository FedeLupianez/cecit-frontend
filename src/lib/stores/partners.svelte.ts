import { apiFetch } from "$lib/api-client";

export interface Partner {
    id_partner: string;
    name: string;
    logo: string;
    directions: string[];
    active: boolean;
}

let partners: Partner[] = $state([]);
let loaded = false;

export async function loadPartners() {
    if (loaded) return;
    loaded = true;
    try {
        const res = await apiFetch("partners/all");
        if (res.ok) {
            partners = await res.json();
        }
    } catch {
        /* noop */
    }
}

export function getPartners() {
    return partners;
}

export function resetPartners() {
    partners = [];
    loaded = false;
}