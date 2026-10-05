import { benefits } from "$lib/data/benefits.js";

export interface BenefitRequest {
    id: string;
    title: string;
    image: string;
    partner: string;
    description: string;
    startDate: string;
    endDate: string;
    requestedAt: string;
    requestedBy: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
}

// Fuente local temporal. Cuando exista el endpoint, se puede reemplazar este
// arreglo por la respuesta de la API manteniendo el contrato BenefitRequest.
export const mockBenefitRequests: BenefitRequest[] = [
    { id: "REQ-001", title: benefits[0].title, image: benefits[0].image, partner: "BECERRA", description: "20% de descuento en cualquier hamburguesa del menú", startDate: "01/10/2026", endDate: "31/12/2026", requestedAt: "28/09/2026", requestedBy: "María López", status: "PENDING" },
    { id: "REQ-002", title: benefits[1].title, image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop", partner: "BECERRA", description: "30% de descuento en combos seleccionados de fast food", startDate: "05/10/2026", endDate: "31/12/2026", requestedAt: "29/09/2026", requestedBy: "Julián Pérez", status: "PENDING" },
    { id: "REQ-003", title: "30% EN FAST FOOD", image: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=1000&auto=format&fit=crop", partner: "BECERRA", description: "30% de descuento en platos seleccionados", startDate: "10/10/2026", endDate: "10/01/2027", requestedAt: "30/09/2026", requestedBy: "Lucía Gómez", status: "PENDING" },
    { id: "REQ-004", title: benefits[0].title, image: benefits[0].image, partner: "BECERRA", description: "2x1 en hamburguesas clásicas, todos los días", startDate: "01/11/2026", endDate: "31/01/2027", requestedAt: "01/10/2026", requestedBy: "María López", status: "PENDING" },
    { id: "REQ-005", title: "30% EN FAST FOOD", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop", partner: "BECERRA", description: "30% de descuento en menú ejecutivo", startDate: "15/10/2026", endDate: "15/01/2027", requestedAt: "02/10/2026", requestedBy: "Julián Pérez", status: "PENDING" },
    { id: "REQ-006", title: benefits[1].title, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop", partner: "BECERRA", description: "Descuento especial en menú para llevar", startDate: "20/10/2026", endDate: "20/01/2027", requestedAt: "03/10/2026", requestedBy: "Lucía Gómez", status: "PENDING" },
];
