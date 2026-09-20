import { browser } from "$app/environment";
import { accessToken } from "$lib/stores/authStore";
import { profileStore } from "$lib/stores/profileStore";

export const load = async ({ url }) => {
    if (!browser) return {};

    if (url.pathname === "/login" || url.pathname === "/signup") return {};

    if (accessToken.getToken() && profileStore.getProfile()) return {};

    try {
        const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) return {};
        const { access_token, profile } = await res.json();
        if (access_token) accessToken.setToken(access_token);
        if (profile) profileStore.setProfile(profile);
    } catch {
        // apiFetch will handle 401s on subsequent requests
    }
    return {};
};
