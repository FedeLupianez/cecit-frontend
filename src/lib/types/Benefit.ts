export interface BenefitsCreateDTO {
    id_admin: string;
    id_partner: string;
    id_type: number;
    start_date: string;
    end_date: string;
    image: string;
    title: string;
    description: string;
    coupons: number;
    max_coupons: number;
    max_per_user: number;
    payment_methods: string[];
    refund_limit: number | null;
}

/**
 * El backend ya expone estos estados en la columna `status` de `Benefits`.
 * `PENDING` marca un beneficio creado por un PARTNER_ADMIN a la espera de que
 * un CECIT_ADMIN lo acepte, y `REJECTED` uno que fue rechazado.
 */
export type BenefitStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "PENDING"
    | "REJECTED";

export interface Benefit {
    id_benefit: string;
    id_admin: string;
    id_partner: string;
    partner: string;
    type: string;
    categories: string[];
    payment_methods: string[];
    logo: string;
    directions: string[];
    start_date: string;
    end_date: string;
    image: string;
    title: string;
    description: string;
    coupons: number;
    max_coupons: number;
    max_per_user: number;
    refund_limit: number;
    status?: BenefitStatus;
}
