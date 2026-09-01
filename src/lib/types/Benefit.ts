export interface Benefit {
    id_benefit: string;
    id_admin: string;
    id_partner: string;
    partner: string;
    type: string;
    categories: string[];
    payment_methods: string[];
    logo: string;
    direction: string;
    start_date: string;
    end_date: string;
    image: string;
    title: string;
    description: string;
    coupons: number;
    max_coupons: number;
    max_per_user: number;
}
