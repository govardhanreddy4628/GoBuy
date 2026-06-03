import type { Payment, PaymentInsert, PaymentUpdate } from '../lib/database.types';

let mockPayments: Payment[] = [
  {
    id: '1',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-001',
    customer_name: 'John Smith',
    customer_email: 'john.smith@example.com',
    amount: 249.99,
    currency: 'USD',
    payment_method: 'credit_card',
    payment_status: 'completed',
    transaction_id: 'TXN-20251013-001',
    payment_date: new Date(2025, 9, 13, 14, 30).toISOString(),
    description: 'Order payment for wireless headphones and accessories',
    metadata: { card_last4: '4242', card_brand: 'Visa' },
    created_at: new Date(2025, 9, 13, 14, 30).toISOString(),
    updated_at: new Date(2025, 9, 13, 14, 30).toISOString(),
  },
  {
    id: '2',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-002',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.j@example.com',
    amount: 89.50,
    currency: 'USD',
    payment_method: 'paypal',
    payment_status: 'completed',
    transaction_id: 'TXN-20251013-002',
    payment_date: new Date(2025, 9, 13, 10, 15).toISOString(),
    description: 'Payment for organic cotton t-shirts',
    metadata: { paypal_email: 'sarah.j@example.com' },
    created_at: new Date(2025, 9, 13, 10, 15).toISOString(),
    updated_at: new Date(2025, 9, 13, 10, 15).toISOString(),
  },
  {
    id: '3',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-003',
    customer_name: 'Michael Brown',
    customer_email: 'm.brown@example.com',
    amount: 599.00,
    currency: 'USD',
    payment_method: 'credit_card',
    payment_status: 'processing',
    transaction_id: 'TXN-20251013-003',
    payment_date: new Date(2025, 9, 13, 16, 45).toISOString(),
    description: 'Bulk order - 10 smart watches',
    metadata: { card_last4: '1234', card_brand: 'Mastercard' },
    created_at: new Date(2025, 9, 13, 16, 45).toISOString(),
    updated_at: new Date(2025, 9, 13, 16, 45).toISOString(),
  },
  {
    id: '4',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-004',
    customer_name: 'Emily Davis',
    customer_email: 'emily.d@example.com',
    amount: 34.99,
    currency: 'USD',
    payment_method: 'debit_card',
    payment_status: 'completed',
    transaction_id: 'TXN-20251012-001',
    payment_date: new Date(2025, 9, 12, 9, 20).toISOString(),
    description: 'Stainless steel water bottle purchase',
    metadata: { card_last4: '5678', card_brand: 'Visa' },
    created_at: new Date(2025, 9, 12, 9, 20).toISOString(),
    updated_at: new Date(2025, 9, 12, 9, 20).toISOString(),
  },
  {
    id: '5',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-005',
    customer_name: 'David Wilson',
    customer_email: 'd.wilson@example.com',
    amount: 149.99,
    currency: 'USD',
    payment_method: 'credit_card',
    payment_status: 'failed',
    transaction_id: 'TXN-20251012-002',
    payment_date: new Date(2025, 9, 12, 15, 30).toISOString(),
    description: 'Payment declined - insufficient funds',
    metadata: { card_last4: '9876', card_brand: 'Amex', error: 'Insufficient funds' },
    created_at: new Date(2025, 9, 12, 15, 30).toISOString(),
    updated_at: new Date(2025, 9, 12, 15, 30).toISOString(),
  },
  {
    id: '6',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-006',
    customer_name: 'Lisa Anderson',
    customer_email: 'lisa.a@example.com',
    amount: 79.99,
    currency: 'USD',
    payment_method: 'paypal',
    payment_status: 'refunded',
    transaction_id: 'TXN-20251011-001',
    payment_date: new Date(2025, 9, 11, 11, 0).toISOString(),
    description: 'Refunded - customer returned leather laptop bag',
    metadata: { paypal_email: 'lisa.a@example.com', refund_reason: 'Customer return' },
    created_at: new Date(2025, 9, 11, 11, 0).toISOString(),
    updated_at: new Date(2025, 9, 13, 14, 0).toISOString(),
  },
  {
    id: '7',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-007',
    customer_name: 'Robert Martinez',
    customer_email: 'r.martinez@example.com',
    amount: 299.99,
    currency: 'USD',
    payment_method: 'bank_transfer',
    payment_status: 'pending',
    transaction_id: 'TXN-20251013-004',
    payment_date: new Date(2025, 9, 13, 8, 0).toISOString(),
    description: 'Bank transfer payment - awaiting confirmation',
    metadata: { bank_name: 'Chase Bank', reference: 'REF123456' },
    created_at: new Date(2025, 9, 13, 8, 0).toISOString(),
    updated_at: new Date(2025, 9, 13, 8, 0).toISOString(),
  },
  {
    id: '8',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-008',
    customer_name: 'Jennifer Taylor',
    customer_email: 'jen.taylor@example.com',
    amount: 129.99,
    currency: 'USD',
    payment_method: 'credit_card',
    payment_status: 'completed',
    transaction_id: 'TXN-20251010-001',
    payment_date: new Date(2025, 9, 10, 13, 45).toISOString(),
    description: 'Yoga mat and fitness accessories',
    metadata: { card_last4: '3456', card_brand: 'Visa' },
    created_at: new Date(2025, 9, 10, 13, 45).toISOString(),
    updated_at: new Date(2025, 9, 10, 13, 45).toISOString(),
  },
  {
    id: '9',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-009',
    customer_name: 'James Clark',
    customer_email: 'james.c@example.com',
    amount: 459.97,
    currency: 'USD',
    payment_method: 'credit_card',
    payment_status: 'completed',
    transaction_id: 'TXN-20251009-001',
    payment_date: new Date(2025, 9, 9, 16, 20).toISOString(),
    description: 'Multiple items - electronics bundle',
    metadata: { card_last4: '7890', card_brand: 'Mastercard' },
    created_at: new Date(2025, 9, 9, 16, 20).toISOString(),
    updated_at: new Date(2025, 9, 9, 16, 20).toISOString(),
  },
  {
    id: '10',
    user_id: 'demo-user-id',
    order_id: 'ORD-2025-010',
    customer_name: 'Amanda White',
    customer_email: 'amanda.w@example.com',
    amount: 199.50,
    currency: 'USD',
    payment_method: 'paypal',
    payment_status: 'cancelled',
    transaction_id: 'TXN-20251008-001',
    payment_date: new Date(2025, 9, 8, 10, 30).toISOString(),
    description: 'Cancelled by customer before shipping',
    metadata: { paypal_email: 'amanda.w@example.com', cancel_reason: 'Changed mind' },
    created_at: new Date(2025, 9, 8, 10, 30).toISOString(),
    updated_at: new Date(2025, 9, 8, 14, 0).toISOString(),
  },
];

export async function getAllPayments(): Promise<Payment[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = [...mockPayments].sort((a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      );
      resolve(sorted);
    }, 300);
  });
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const payment = mockPayments.find(p => p.id === id);
      resolve(payment || null);
    }, 300);
  });
}

export async function getPaymentsByStatus(status: string): Promise<Payment[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockPayments.filter(p => p.payment_status === status);
      resolve(filtered);
    }, 300);
  });
}

export async function getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockPayments.filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
      resolve(filtered);
    }, 300);
  });
}

export async function searchPayments(query: string): Promise<Payment[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const filtered = mockPayments.filter(p =>
        p.customer_name.toLowerCase().includes(lowerQuery) ||
        p.customer_email.toLowerCase().includes(lowerQuery) ||
        p.order_id.toLowerCase().includes(lowerQuery) ||
        p.transaction_id.toLowerCase().includes(lowerQuery)
      );
      resolve(filtered);
    }, 300);
  });
}

export async function createPayment(payment: PaymentInsert): Promise<Payment | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPayment: Payment = {
        ...payment,
        id: Math.random().toString(36).substr(2, 9),
        currency: payment.currency || 'USD',
        payment_status: payment.payment_status || 'pending',
        transaction_id: payment.transaction_id || `TXN-${Date.now()}`,
        payment_date: payment.payment_date || new Date().toISOString(),
        description: payment.description || '',
        metadata: payment.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockPayments.push(newPayment);
      resolve(newPayment);
    }, 300);
  });
}

export async function updatePayment(
  id: string,
  updates: PaymentUpdate
): Promise<Payment | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockPayments.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPayments[index] = {
          ...mockPayments[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        resolve(mockPayments[index]);
      } else {
        resolve(null);
      }
    }, 300);
  });
}

export async function deletePayment(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockPayments.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPayments.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
}

export async function getTotalRevenue(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = mockPayments
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      resolve(total);
    }, 300);
  });
}

export async function getPaymentStats(): Promise<{
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  totalRevenue: number;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stats = {
        total: mockPayments.length,
        completed: mockPayments.filter(p => p.payment_status === 'completed').length,
        pending: mockPayments.filter(p => p.payment_status === 'pending').length,
        failed: mockPayments.filter(p => p.payment_status === 'failed').length,
        refunded: mockPayments.filter(p => p.payment_status === 'refunded').length,
        totalRevenue: mockPayments
          .filter(p => p.payment_status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
      };
      resolve(stats);
    }, 300);
  });
}
