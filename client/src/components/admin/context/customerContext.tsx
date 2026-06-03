import { createContext, useContext, useEffect, useState } from "react";
import { Customer } from "../types/customers";


type CustomerContextType = {
  customers: Customer[];
  loading: boolean;
  error: string | null;

  fetchCustomers: () => Promise<void>;
  addCustomer: (data: Partial<Customer>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  viewCustomer: (id: string) => Customer | undefined;
};

const CustomerContext = createContext<CustomerContextType | null>(null);

export const CustomerProvider = ({ children }: { children: React.ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API = "http://localhost:8080/api/v1/user/customers";

  // ✅ FETCH
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setCustomers(data.data || []);
    } catch {
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD
  const addCustomer = async (customer: Partial<Customer>) => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });

      const data = await res.json();

      // optimistic update
      setCustomers((prev) => [data.data, ...prev]);
    } catch {
      setError("Failed to add customer");
    }
  };

  // ✅ UPDATE
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? data.data : c))
      );
    } catch {
      setError("Failed to update customer");
    }
  };

  // ✅ DELETE
  const deleteCustomer = async (id: string) => {
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });

      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Failed to delete customer");
    }
  };

  // ✅ VIEW (local)
  const viewCustomer = (id: string) => {
    return customers.find((c) => c.id === id);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        error,
        fetchCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        viewCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomers must be used inside Provider");
  return ctx;
};