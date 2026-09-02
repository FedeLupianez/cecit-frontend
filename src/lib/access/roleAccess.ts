export type AccountRole = "USER" | "CECIT_ADMIN" | "PARTNER_ADMIN";

export interface RoleAction {
    label: string;
    href: string;
}

export interface RoleAccess {
    label: string;
    actions: RoleAction[];
}

/**
 * The backend exposes one `role` per account in GET /auth/profile, but it does
 * not expose a permissions endpoint. This mapping mirrors its real guards and
 * keeps the navigation rules in one place until such an endpoint exists.
 */
const accessByRole: Record<AccountRole, RoleAccess> = {
    USER: {
        label: "Usuario",
        actions: [{ label: "Configuración", href: "/profile#configuration" }]
    },
    CECIT_ADMIN: {
        label: "Administrador",
        actions: [
            { label: "Panel de administrador", href: "/admin-panel" },
            { label: "Configuración", href: "/profile#configuration" }
        ]
    },
    PARTNER_ADMIN: {
        label: "Negociante",
        actions: [
            { label: "Panel de negocio", href: "/business-panel" },
            { label: "Canjear Beneficio", href: "/redeem" },
            { label: "Configuración", href: "/profile#configuration" }
        ]
    }
};

export function getRoleAccess(role: string | undefined): RoleAccess | undefined {
    return role && role in accessByRole
        ? accessByRole[role as AccountRole]
        : undefined;
}
