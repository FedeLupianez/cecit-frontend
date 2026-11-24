import { get, writable } from "svelte/store";
import { browser } from "$app/environment";
import type { Profile } from "$lib/stores/profileStore";

const AUTH_KEY = "cecit_auth";

interface StoredAuth {
    profile: Profile;
    expiresAt: number; // timestamp ms
}

function createAuthStore() {
    const { subscribe, set } = writable<string | null>(null);
    return {
        subscribe,
        setToken: (token: string) => set(token),
        clear: () => set(null),
        getToken: () => get({ subscribe }),
        // localStorage helpers
        saveAuth: (profile: Profile, expiresAt: number) => {
            if (!browser) return;
            const data: StoredAuth = { profile, expiresAt };
            localStorage.setItem(AUTH_KEY, JSON.stringify(data));
        },
        loadAuth: (): StoredAuth | null => {
            if (!browser) return null;
            try {
                const raw = localStorage.getItem(AUTH_KEY);
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        },
        clearAuth: () => {
            if (!browser) return;
            localStorage.removeItem(AUTH_KEY);
        },
        isAuthValid: (stored: StoredAuth | null): boolean => {
            return !!stored && stored.expiresAt > Date.now();
        }
    }
}

export const accessToken = createAuthStore();
