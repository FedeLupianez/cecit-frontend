import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, cookies, url }) => {
    if (url.pathname === "/login") return {};

    const refreshToken = cookies.get("refresh_token_cecit");
    if (!refreshToken) throw redirect(302, "/login");

    try {
        const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { Cookie: `refresh_token_cecit=${refreshToken}` },
        });

        if (!refreshRes.ok) throw redirect(302, "/login");

        const { access_token } = await refreshRes.json();

        const profileRes = await fetch("/api/auth/profile", {
            method: "GET",
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!profileRes.ok) throw redirect(302, "/login");

        const profile = await profileRes.json();

        return { accessToken: access_token, profile };
    } catch (e) {
        if (e && typeof e === "object" && "status" in e && "location" in e) {
            throw e;
        }
        throw redirect(302, "/login");
    }
};
