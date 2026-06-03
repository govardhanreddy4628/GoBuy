import React, { useState, useEffect } from 'react';
import { Customer } from '../types/customers';


type Props = {
  initialData?: Partial<Customer>;
  onSubmit: (customer: Customer) => void;
  onCancel: () => void;
};

const CustomerForm: React.FC<Props> = ({ initialData = {}, onSubmit, onCancel }) => {
  const [form, setForm] = useState<Partial<Customer>>(initialData);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  
 // if you use it as Number(form.orders) ?? 0 gives error because Number(something) always returns number so nullish cohalescing operator will not work thats why use Number(form.orders ?? 0),

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.name || !form.email) {
    alert("Name & Email required");
    return;
  }

  const customer: Customer = {
    name: form.name,
    avatar: form.avatar || "https://via.placeholder.com/150",
    email: form.email,
    phone: form.phone || "",
    address: form.address || "",
    status: form.status === "Inactive" ? "Inactive" : "Active",
    role: "USER",
  };

  onSubmit(customer);
};

  return (
    <form
      onSubmit={handleSubmit}
      className=""
    >
     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          placeholder="Name"
          value={form.name || ''}
          onChange={handleChange}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email || ''}
          onChange={handleChange}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
          required
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone || ''}
          onChange={handleChange}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address || ''}
          onChange={handleChange}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
        />
        <input
          name="orders"
          placeholder="Orders"
          type="number"
          value={form.orders ?? 0}
          onChange={handleChange}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
        />
        <input
          name="totalSpend"
          placeholder="Total Spend"
          type="number"
          value={form.totalSpend ?? 0}
          onChange={handleChange}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
        />
        <input
          name="lastOrder"
          placeholder="Last Order Date"
          type="date"
          value={form.lastOrder || ''}
          onChange={handleChange}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
        />
        <select
          name="status"
          value={form.status || 'Active'}
          onChange={handleChange}
          className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          {form.id ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
