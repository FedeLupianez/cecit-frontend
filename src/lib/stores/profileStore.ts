import { get, writable } from "svelte/store";

export interface Profile {
    user_id: string;
    email: string;
}

function createProfileStore() {
    const { subscribe, set } = writable<Profile | null>(null);
    return {
        subscribe,
        setProfile: (profile: Profile) => set(profile),
        clear: () => set(null),
        getProfile: () => get({ subscribe })
    }
}

export const profileStore = createProfileStore();
