import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, cookies, url }) => {
    if (env.AUTH_DISABLED === "true") {
        return {
            accessToken: "dev-mode-token",
            profile: {
                user_id: "dev-user",
                email: "dev@cecit.local",
                role: env.DEV_USER_ROLE ?? "USER",
            },
        };
    }

    if (url.pathname === "/login") return {};

    const refreshToken = cookies.get("refresh_token_cecit");
    if (!refreshToken) throw redirect(302, "/login");

    try {
        const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { Cookie: `refresh_token_cecit=${refreshToken}` },
        });

        if (!refreshRes.ok) throw redirect(302, "/login");

        // El backend rota el refresh token en cada refresh: hay que propagar
        // la cookie nueva. Se busca por nombre en el array (unir con join es
        // frágil porque Expires contiene comas).
        const setCookieValues = refreshRes.headers.getSetCookie?.() ?? [];
        let newRefresh: string | null = null;
        let newMaxAge: number | undefined;
        for (const entry of setCookieValues) {
            const match = entry.match(/^refresh_token_cecit=([^;]+)/);
            if (!match) continue;
            newRefresh = match[1];
            const maxAge = entry.match(/Max-Age=(\d+)/i);
            if (maxAge) newMaxAge = parseInt(maxAge[1]);
            break;
        }
        if (!newRefresh) {
            const single = refreshRes.headers.get("set-cookie");
            const match = single?.match(/refresh_token_cecit=([^;]+)/);
            if (match) {
                newRefresh = match[1];
                const maxAge = single?.match(/Max-Age=(\d+)/i);
                if (maxAge) newMaxAge = parseInt(maxAge[1]);
            }
        }
        if (newRefresh) {
            cookies.set("refresh_token_cecit", newRefresh, {
                path: "/",
                httpOnly: true,
                secure: !dev,
                sameSite: "lax",
                ...(newMaxAge ? { maxAge: newMaxAge } : {}),
            });
        }

        const { access_token, profile } = await refreshRes.json();

        // El backend ya devuelve el perfil en el refresh: una sola llamada
        // por navegación en vez de refresh + profile.
        return { accessToken: access_token, profile };
    } catch (e) {
        if (e && typeof e === "object" && "status" in e && "location" in e) {
            throw e;
        }
        throw redirect(302, "/login");
    }
};
