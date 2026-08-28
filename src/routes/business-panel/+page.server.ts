import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    const { profile } = await parent();
    if (profile?.role !== 'PARTNER_ADMIN') throw redirect(303, '/');
    return { profile };
};
