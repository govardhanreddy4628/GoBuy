import { X, CreditCard, Mail, User, Calendar, DollarSign, FileText, Hash } from 'lucide-react';
import type { Payment } from '../../lib/database.types';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function PaymentDetailsModal({ isOpen, onClose, payment }: PaymentDetailsModalProps) {
  if (!isOpen || !payment) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Payment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {payment.customer_name}
                </h3>
                <p className="text-sm text-gray-500">{payment.customer_email}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.payment_status)}`}>
                {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
              </span>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Payment Amount</span>
                <span className="text-3xl font-bold text-blue-900">
                  ${payment.amount.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-blue-700 mt-1">{payment.currency}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p className="text-sm text-gray-900 font-mono">{payment.order_id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                  <p className="text-sm text-gray-900 font-mono">{payment.transaction_id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-sm text-gray-900">{getPaymentMethodLabel(payment.payment_method)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Date</p>
                  <p className="text-sm text-gray-900">
                    {new Date(payment.payment_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {payment.description && (
              <div className="flex items-start gap-3 pt-4 border-t">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-900">{payment.description}</p>
                </div>
              </div>
            )}

            {payment.metadata && Object.keys(payment.metadata).length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-500 mb-3">Additional Information</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(payment.metadata as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <dt className="text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </dt>
                        <dd className="text-gray-900 font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="text-gray-900">
                    {new Date(payment.created_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="text-gray-900">
                    {new Date(payment.updated_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
