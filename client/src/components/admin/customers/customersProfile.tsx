import React, { useEffect, useState } from 'react';
import { Customer } from '../types/customers';
import { useCustomers } from '../context/customerContext';
import { GET } from '../../../api/api_utility';

type Props = { customer: Customer | null };
type Order = {
  id: string;
  orderId: string;
  totalItems: number;
  totalAmount: number;
  subTotalAmount: number;
  createdAt: string;
  updatedAt: string;
};

const TABS = ['Info', 'Orders', 'Activity'] as const;
type Tab = (typeof TABS)[number];

// ✅ reuse this everywhere in app
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
};

const CustomerProfile: React.FC<Props> = ({ customer }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const { updateCustomer } = useCustomers(); // ✅ context usage

  useEffect(() => {
    if (!customer || activeTab !== 'Orders') return;
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await GET(`api/v1/order/user/${customer.id}`);
        setOrders(res.data.data || []);
        console.log(res)
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [customer, activeTab]);

  useEffect(() => {
    if (!customer || activeTab !== 'Info') return;
    const fetchAddress = async () => {
      try {
        const res = await GET(`api/v1/address/${customer.id}`);
        setAddresses(res.data.data || []);
        console.log(res)
      } catch (err) {
        console.error("Failed to fetch address", err);
      }
    };
    fetchAddress();
  }, [customer, activeTab]);


  const handlePrint = () => window.print();

  const handleEmail = () => {
    if (customer) window.location.href = `mailto:${customer.email}`;
  };

  // ✅ REAL DEACTIVATE
  const handleDeactivate = async () => {
    if (!customer || customer.status === 'Inactive') return;

    await updateCustomer(customer.id, {
      status: 'Inactive',
    });
  };

  if (!customer) return null;

  return (
    <>
      {/* Tab Selector */}
      <div className="flex space-x-6 border-b mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium border-b-2 transition ${activeTab === tab
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300'
              : 'border-transparent text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Info' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                customer.name
              )}&background=random`}
              alt={customer.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {customer.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{customer.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{customer.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-bold">
                Address
              </label>

              <div className="text-gray-800 dark:text-white">
                {addresses.length > 0 ? (
                  <>
                    <div>
                      {addresses[0].houseNumber}, {addresses[0].address_line}
                    </div>
                    <div>
                      {addresses[0].city}, {addresses[0].state}
                    </div>
                    <div>{addresses[0].pincode}</div>
                  </>
                ) : (
                  "-"
                )}
              </div>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-bold">Joined</label>
              <p className="text-gray-800 dark:text-white">
                {new Date(customer.joined).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 font-bold">Status: </label>
              <p
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${customer.status === 'Active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                  }`}
              >
                {customer.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Orders' && (
        <div>
          {loadingOrders ? (
            <p className="text-sm text-gray-500">Loading orders...</p>
          ) : (
            <div className="w-full border mt-2 max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Items</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Subtotal</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Updated</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b dark:border-gray-600">
                      <td className="p-2">{order.id}</td>
                      <td className="p-2">{order.orderId}</td>
                      <td className="p-2">{order.totalItems}</td>
                      <td className="p-2">₹{order.totalAmount}</td>
                      <td className="p-2">₹{order.subTotalAmount}</td>
                      <td className="p-2">{formatDate(order.createdAt)}</td>
                      <td className="p-2">{formatDate(order.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>Activity log or recent actions will go here.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleEmail}
          className="bg-indigo-500 text-white px-3 py-1.5 rounded hover:bg-indigo-600"
        >
          📧 Email
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600"
        >
          🖨 Print
        </button>
        <button
          onClick={handleDeactivate}
          disabled={customer.status === 'Inactive'}
          className={`px-3 py-1.5 rounded text-white ${customer.status === 'Inactive'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700'
            }`}
        >
          🚫 Deactivate
        </button>
      </div>
    </>
  );
};

export default CustomerProfile;
