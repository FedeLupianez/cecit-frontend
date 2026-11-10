import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import type { LayoutServerLoad } from "./$types";

// Base path para builds estáticos (ej: /beneficios)
const basePath = env.BASE_PATH ? `/${env.BASE_PATH.replace(/^\/+|\/+$/g, '')}` : '';

const publicPaths = [`${basePath}/login`, `${basePath}/signup`];

const loginRedirect = `${basePath}/login`;

export const load: LayoutServerLoad = async ({ cookies, url, request, platform }) => {
    if (env.AUTH_DISABLED === "true") return {};

    if (publicPaths.includes(url.pathname)) return {};

    // Skip auth check entirely during static build/prerender
    if (env.STATIC_BUILD === "true") return {};

    // Skip if no cookie header (happens during prerender)
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return {};

    // No redirigir durante prerendering (el prerenderer no tiene cookies)
    if (request.headers.get("x-sveltekit-prerender") === "1") return {};

    const refreshToken = cookies.get("refresh_token_cecit");
    if (!refreshToken) throw redirect(302, loginRedirect);

    return {};
};
