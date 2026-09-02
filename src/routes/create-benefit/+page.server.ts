import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../admin-panel/$types';

export const load: PageServerLoad = async ({ parent }) => {
    const { profile } = await parent();
    if (profile?.role !== 'CECIT_ADMIN') throw redirect(303, '/');
    return { profile };
};
