export type Customer = {
  id: number;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  address: string;
  joined: string;
  orders: number;
  totalSpend: number;
  lastOrder: string;
  status: "Active" | "Inactive";
  role:"USER"
};

export const customersData: Customer[] = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  return {
    id,
    name: `Customer ${id}`,
    avatar: `https://i.pravatar.cc/100?img=${(id % 70) + 1}`, // rotates through avatars
    email: `customer${id}@example.com`,
    phone: `+1 555-${1000 + id}`,
    address: `${id} Market St, City ${id}`,
    joined: `2024-${String((id % 12) + 1).padStart(2, "0")}-${String(
      (id % 28) + 1
    ).padStart(2, "0")}`,
    orders: id % 12, // distribute orders
    totalSpend: (id % 12) * 75.5, // proportional to orders
    lastOrder: id % 5 === 0 ? "-" : `2024-0${(id % 9) + 1}-15`, // some have "-"
    status: (id % 3 === 0 ? "Inactive" : "Active") as "Inactive" | "Active", // strict union
    role:"USER"
  };
});
