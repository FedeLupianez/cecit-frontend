
interface Category {
    name: string;
    icon: string;
}

let filters: string[] = $state([]);
let categories: Category[] = $state([]);
let loaded = false;

export async function loadCategories() {
    if (loaded) return;
    loaded = true;
    try {
        const res = await fetch("/api/categories/actives");
        if (res.ok) {
            const data = await res.json();
            filters = ["Todo", ...data.map((c: { name: string }) => c.name)];
            categories = [...data.map((c: { name: string, icon_url: string }): Category => ({ name: c.name, icon: c.icon_url }))];
            console.log(`Fetch Categories : ${categories}`);
        }
    } catch (err) {
        console.log(err);
    }
}

export function getFilters() {
    return filters;
}
export function getCategories() {
    return categories;
}
