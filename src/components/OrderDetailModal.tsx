
import React from 'react';
import { X, Phone, Mail, Calendar, Package, CreditCard, User, Clock, Hash, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderDetail } from '@/services/adminApi';

interface OrderDetailModalProps {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ 
  order, 
  isOpen, 
  onClose
}) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentColor = (paymentStatus: string) => {
    return paymentStatus === 'paid'
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const calculateTotal = (quantity: number, waecType: string) => {
    if (order.amount) return order.amount;
    const prices = { BECE: 50, WASSCE: 75, NOVDEC: 60 };
    return quantity * (prices[waecType as keyof typeof prices] || 50);
  };

  const formatStatusText = (status: string) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Synchronize order status with payment status logic
  const getEffectiveStatus = () => {
    const paymentStatus = order.payment_status || 'unpaid';
    const orderStatus = order.status || 'pending';

    // If payment is paid, status should be completed
    if (paymentStatus === 'paid' && orderStatus === 'pending') {
      return 'completed';
    }
    
    // If payment is unpaid, status should be pending
    if (paymentStatus === 'unpaid' && orderStatus === 'completed') {
      return 'pending';
    }

    return orderStatus;
  };

  const effectiveStatus = getEffectiveStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <Package className="h-6 w-6 mr-2 text-blue-600" />
            Order Details #{order.id.substring(0, 8)}...
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Complete information and transaction details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Order Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-medium text-blue-600 font-mono">{order.id}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">WAEC Type</p>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {order.waec_type || 'Not specified'}
                </span>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Quantity</p>
                <p className="font-medium text-lg">{order.quantity || 0} checkers</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="font-bold text-green-600 text-lg">
                  ₵{calculateTotal(order.quantity || 0, order.waec_type || 'WASSCE').toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="font-medium">{formatDate(order.updated_at)}</p>
              </div>
            </div>

            {/* Payment References */}
            {(order.payment_reference || order.transaction_id) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.payment_reference && (
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Payment Reference</p>
                    <p className="font-medium text-purple-600 font-mono">{order.payment_reference}</p>
                  </div>
                )}
                {order.transaction_id && (
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <p className="font-medium text-indigo-600 font-mono">{order.transaction_id}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <Phone className="h-8 w-8 text-green-500 mr-4 bg-green-100 rounded-full p-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-lg">{order.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <Mail className="h-8 w-8 text-blue-500 mr-4 bg-blue-100 rounded-full p-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium text-lg">{order.email || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Status */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Order Status
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border ${getStatusColor(effectiveStatus)}`}>
                      {effectiveStatus === 'completed' ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      {formatStatusText(effectiveStatus)}
                    </span>
                    {effectiveStatus !== order.status && (
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        Auto-synced
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600">Created</p>
                    <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600">Updated</p>
                    <p className="text-sm font-medium">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Payment Information
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                  <span className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-full border ${getPaymentColor(order.payment_status || 'unpaid')}`}>
                    {order.payment_status === 'paid' ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-1" />
                    )}
                    {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                {order.payment_method && (
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{order.payment_method}</p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-bold text-green-600 text-xl">
                    ₵{calculateTotal(order.quantity || 0, order.waec_type || 'WASSCE').toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Checkers */}
          {order.checkers && order.checkers.length > 0 && (
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Hash className="h-5 w-5 mr-2 text-green-600" />
                Assigned Checkers ({order.checkers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                {order.checkers.map((checker, index) => (
                  <div key={checker.id} className="bg-white rounded-lg p-4 border border-green-300 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                        {checker.waec_type}
                      </span>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                    <div className="space-y-1">
                      <div>
                        <p className="text-xs text-gray-600">Serial Number</p>
                        <p className="font-mono text-sm font-medium">{checker.serial}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">PIN Code</p>
                        <p className="font-mono text-sm font-medium">{checker.pin}</p>
                      </div>
                      {checker.assigned_at && (
                        <div className="flex items-center mt-2 pt-2 border-t border-gray-200">
                          <Clock className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">
                            Assigned: {formatDate(checker.assigned_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {order.notes && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                Additional Notes
              </h3>
              <p className="text-gray-700 bg-white rounded-lg p-3 border">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
