import { apiFetch } from "$lib/api-client";
import type { Benefit } from "$lib/types/Benefit";

interface Category {
    name: string;
    icon: string;
}

interface Partner {
    id_partner: string;
    name: string;
    logo: string;
    directions: string[];
    active: boolean;
}

export const load = async () => {
    // Fetch all home page data in parallel
    const [categoriesRes, popularRes, newsRes, partnersRes] = await Promise.all([
        apiFetch("categories/actives"),
        apiFetch("benefits/popular"),
        apiFetch("benefits/news"),
        apiFetch("partners/all"),
    ]);

    const categories: Category[] = categoriesRes.ok
        ? (await categoriesRes.json()).map((c: { name: string; icon_url: string }) => ({
            name: c.name,
            icon: c.icon_url,
        }))
        : [];

    const popularBenefits: Benefit[] = popularRes.ok ? await popularRes.json() : [];
    const newsBenefits: Benefit[] = newsRes.ok ? await newsRes.json() : [];

    const partners: Partner[] = partnersRes.ok ? await partnersRes.json() : [];

    return {
        categories,
        popularBenefits,
        newsBenefits,
        partners,
    };
};