import { browser } from "$app/environment";
import { accessToken } from "$lib/stores/authStore";
import { profileStore } from "$lib/stores/profileStore";
import { apiFetch } from "$lib/api-client";
import { loadCategories } from "$lib/stores/categories.svelte";
import { loadPartners } from "$lib/stores/partners.svelte";
import { base } from "$app/paths";
import { redirect } from "@sveltejs/kit";

export const prerender = true;
export const ssr = false;
export const trailingSlash = 'always';

// Routes that don't require authentication
const PUBLIC_PATHS = new Set([
    `/`,
    `${base}/`,
    `${base}/benefits`,
    `${base}/login`,
    `${base}/signup`,
    `${base}/redeem`,
]);

function isPublicPath(pathname: string) {
    return PUBLIC_PATHS.has(pathname) || pathname.startsWith(`${base}/benefits/`);
}

export const load = async ({ url }: { url: URL }) => {
    // Skip during prerender (no window) and SSR
    if (!browser || typeof window === 'undefined') return {};

    const pathname = url.pathname;
    const isPublic = isPublicPath(pathname);

    // If we already have token + profile in memory, nothing to do
    if (accessToken.getToken() && profileStore.getProfile()) {
        if (isPublic) {
            loadCategories();
            loadPartners();
        }
        return {};
    }

    // Try to restore from localStorage first (instant UI)
    const stored = accessToken.loadAuth();
    if (accessToken.isAuthValid(stored)) {
        // Restore profile immediately for instant authenticated UI
        profileStore.setProfile(stored!.profile);
        
        // Fire-and-forget critical data for public pages
        if (isPublic) {
            loadCategories();
            loadPartners();
        }

        // Background: verify session with backend
        apiFetch("/auth/refresh", { method: "POST" })
            .then(async (res) => {
                if (!res.ok) throw new Error("refresh failed");
                const { access_token, profile, expires_at } = await res.json().catch(() => ({}));
                if (access_token) accessToken.setToken(access_token);
                if (profile) {
                    profileStore.setProfile(profile);
                    const expiresAt = expires_at ? new Date(expires_at).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000;
                    accessToken.saveAuth(profile, expiresAt);
                }
            })
            .catch(() => {
                // Refresh failed: clear local state and redirect if on protected route
                accessToken.clear();
                profileStore.clear();
                accessToken.clearAuth();
                if (!isPublic) {
                    // Use goto for client-side navigation
                    import("$app/navigation").then(({ goto }) => goto(`${base}/login`));
                }
            });

        return {};
    }

    // No valid localStorage: attempt refresh (non-blocking on public pages)
    const refreshPromise = apiFetch("/auth/refresh", { method: "POST" })
        .then(async (res) => {
            if (!res.ok) return null;
            const { access_token, profile, expires_at } = await res.json().catch(() => ({}));
            if (access_token) accessToken.setToken(access_token);
            if (profile) {
                profileStore.setProfile(profile);
                const expiresAt = expires_at ? new Date(expires_at).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000;
                accessToken.saveAuth(profile, expiresAt);
            }
            return { access_token, profile };
        })
        .catch(() => null);

    // Fire critical data loads in parallel with auth refresh
    const dataPromises = isPublic ? [loadCategories(), loadPartners()] : [];

    // Wait for auth refresh (needed for protected routes)
    const authResult = await refreshPromise;

    // Wait for critical data (best-effort)
    await Promise.allSettled(dataPromises);

    // On protected routes, require valid auth
    if (!isPublic && !authResult) {
        throw redirect(302, `${base}/login`);
    }
    return {};
};
