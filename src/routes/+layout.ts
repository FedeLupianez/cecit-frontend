import { browser } from "$app/environment";
import { accessToken } from "$lib/stores/authStore";
import { profileStore } from "$lib/stores/profileStore";
import { apiFetch } from "$lib/api-client";
import { base } from "$app/paths";
import { redirect } from "@sveltejs/kit";

export const prerender = true;

export const load = async ({ url, redirect: doRedirect }) => {
    // Skip during prerender (no window) and SSR
    if (!browser || typeof window === 'undefined') return {};

    const isAuthPage = url.pathname === `${base}/login` || url.pathname === `${base}/signup`;
    if (isAuthPage) return {};

    if (accessToken.getToken() && profileStore.getProfile()) return {};

    try {
        const res = await apiFetch("/auth/refresh", {
            method: "POST",
        });
        if (!res.ok) {
            if (!isAuthPage) doRedirect(302, `${base}/login`);
            return {};
        }
        const { access_token, profile } = await res.json();
        if (access_token) accessToken.setToken(access_token);
        if (profile) profileStore.setProfile(profile);
    } catch {
        if (!isAuthPage) doRedirect(302, `${base}/login`);
    }
    return {};
};
