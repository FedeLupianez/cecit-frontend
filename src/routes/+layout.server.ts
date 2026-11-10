import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, url, request }) => {
    if (env.AUTH_DISABLED === "true") return {};

    if (url.pathname === "/login" || url.pathname === "/signup") return {};

    // No redirigir durante prerendering (el prerenderer no tiene cookies)
    if (request.headers.get("x-sveltekit-prerender") === "1") return {};

    const refreshToken = cookies.get("refresh_token_cecit");
    if (!refreshToken) throw redirect(302, "/login");

    return {};
};