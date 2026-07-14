import { redirect } from "@sveltejs/kit";

export const load = async ({ fetch, url }) => {
    if (url.pathname === '/login')
        return {};

    const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST"
    });

    if (!refreshRes.ok) {
        throw redirect(302, "/login");
    }

    const { access_token } = await refreshRes.json();

    const profileRes = await fetch("/api/auth/profile", {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    });

    if (!profileRes.ok) {
        throw redirect(302, "/login");
    }

    const profile = await profileRes.json();

    return {
        profile,
        access_token
    };
};
