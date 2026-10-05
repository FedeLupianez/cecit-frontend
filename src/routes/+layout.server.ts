import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, url }) => {
    if (env.AUTH_DISABLED === "true") return {};

    if (url.pathname === "/login" || url.pathname === "/signup") return {};

    const refreshToken = cookies.get("refresh_token_cecit");
    if (!refreshToken) throw redirect(302, "/login");

    return {};
};
