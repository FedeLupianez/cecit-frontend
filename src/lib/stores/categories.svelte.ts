let filters: string[] = $state([]);
let loaded = false;

export async function loadCategories() {
    if (loaded) return;
    loaded = true;
    try {
        const res = await fetch("http://localhost:3000/categories/all");
        if (res.ok) {
            const data = await res.json();
            filters = ["Todo", ...data.map((c: { name: string }) => c.name)];
        }
    } catch (err) {
        console.log(err);
    }
}

export function getFilters() {
    return filters;
}
