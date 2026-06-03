import { useState, useEffect } from 'react';
import { Search, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Filter } from 'lucide-react';
import type { Payment } from '../../lib/database.types';
import {
  getAllPayments,
  getPaymentStats,
} from '../../services/mockPaymentService';
import { PaymentDetailsModal } from './PaymentDetailsModal';

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'processing' | 'failed' | 'refunded' | 'cancelled'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'other'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchQuery, filterStatus, filterMethod]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getPaymentStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.customer_name.toLowerCase().includes(query) ||
        p.customer_email.toLowerCase().includes(query) ||
        p.order_id.toLowerCase().includes(query) ||
        p.transaction_id.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.payment_status === filterStatus);
    }

    if (filterMethod !== 'all') {
      filtered = filtered.filter(p => p.payment_method === filterMethod);
    }

    setFilteredPayments(filtered);
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'refunded':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-700 bg-green-100',
      pending: 'text-yellow-700 bg-yellow-100',
      processing: 'text-blue-700 bg-blue-100',
      failed: 'text-red-700 bg-red-100',
      refunded: 'text-gray-700 bg-gray-100',
      cancelled: 'text-gray-700 bg-gray-100',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      paypal: 'PayPal',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      other: 'Other',
    };
    return labels[method as keyof typeof labels] || method;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Track and manage payment transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.completed} completed payments</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Failed</p>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.failed}</p>
          <p className="text-sm text-gray-500 mt-1">Require attention</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Refunded</p>
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.refunded}</p>
          <p className="text-sm text-gray-500 mt-1">Customer refunds</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer, order ID, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.customer_name}</div>
                      <div className="text-sm text-gray-500">{payment.customer_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{payment.order_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">{payment.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getPaymentMethodLabel(payment.payment_method)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.payment_status)}`}>
                      {getStatusIcon(payment.payment_status)}
                      {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.payment_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleViewPayment(payment)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all' || filterMethod !== 'all'
                ? 'Try adjusting your filters'
                : 'No payment transactions available'}
            </p>
          </div>
        )}
      </div>

      <PaymentDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />
    </div>
  );
}
