import { get, writable } from "svelte/store";

function createAuthStore() {
    const { subscribe, set } = writable<string | null>(null);
    return {
        subscribe,
        setToken: (token: string) => set(token),
        clear: () => set(null),
        getToken: () => get({ subscribe })
    }
}

export const accessToken = createAuthStore();
