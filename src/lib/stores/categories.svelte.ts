import { apiFetch } from "$lib/api-client";

interface Category {
    name: string;
    icon: string;
}

let filters: string[] = $state([]);
let categories: Category[] = $state([]);
let loadPromise: Promise<void> | null = null;

export async function loadCategories() {
    if (categories.length) return;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
        try {
            const res = await apiFetch("categories/actives");
            if (res.ok) {
                const data = await res.json();
                filters = ["Todo", ...data.map((c: { name: string }) => c.name)];
                categories = [...data.map((c: { name: string, icon_url: string }): Category => ({ name: c.name, icon: c.icon_url }))];
            }
        } catch {
            /* noop */
        } finally {
            loadPromise = null;
        }
    })();
    return loadPromise;
}

export function getFilters() {
    return filters;
}
export function getCategories() {
    return categories;
}
