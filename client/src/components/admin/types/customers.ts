export type Customer = {
    id?: string;
    name: string;
    avatar?: string;
    email: string;
    phone?: string;
    address: string;
    joined?: string;
    orders?: number;
    totalSpend?: number;
    lastOrder?: string | null;
    status: "Active" | "Inactive";
    role: "USER";
};
