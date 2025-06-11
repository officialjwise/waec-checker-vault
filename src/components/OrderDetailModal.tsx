
import React from 'react';
import { X, Phone, Mail, Calendar, Package, CreditCard, User, Clock, Hash } from 'lucide-react';
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
  onStatusUpdate?: (orderId: string, status: string) => void;
  updating?: string | null;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  updating 
}) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentColor = (paid: boolean) => {
    return paid 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const calculateTotal = (quantity: number, waecType: string) => {
    if (order.amount) return order.amount;
    const prices = { BECE: 50, WASSCE: 75, NOVDEC: 60 };
    return quantity * (prices[waecType as keyof typeof prices] || 50);
  };

  const isPaid = order.payment_status === 'paid';
  const currentStatus = order.status || 'pending';

  const handleStatusUpdate = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(order.id, newStatus);
    }
  };

  const formatStatusText = (status: string) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
          <DialogDescription className="text-gray-500">
            Complete information for order {order.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WAEC Type</p>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {order.waec_type}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-medium">{order.quantity} checkers</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-green-600">
                  ₵{calculateTotal(order.quantity, order.waec_type).toLocaleString()}
                </p>
              </div>
              {order.payment_reference && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Payment Reference</p>
                  <p className="font-medium text-blue-600">{order.payment_reference}</p>
                </div>
              )}
              {order.transaction_id && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-medium text-purple-600">{order.transaction_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium">{order.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Order Status
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(currentStatus)}`}>
                    {formatStatusText(currentStatus)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{new Date(order.updated_at).toLocaleDateString()}</p>
                </div>
                {onStatusUpdate && currentStatus !== 'paid' && currentStatus !== 'cancelled' && (
                  <div className="pt-2 space-y-2">
                    <p className="text-sm text-gray-600">Update Status:</p>
                    <div className="flex space-x-2">
                      {currentStatus === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate('paid')}
                          disabled={updating === order.id}
                        >
                          {updating === order.id ? 'Updating...' : 'Mark as Paid'}
                        </Button>
                      )}
                      {(currentStatus === 'pending') && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleStatusUpdate('cancelled')}
                          disabled={updating === order.id}
                        >
                          {updating === order.id ? 'Updating...' : 'Cancel Order'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getPaymentColor(isPaid)}`}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                {order.payment_method && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{order.payment_method}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Checkers */}
          {order.checkers && order.checkers.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Hash className="h-5 w-5 mr-2" />
                Assigned Checkers ({order.checkers.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {order.checkers.map((checker) => (
                  <div key={checker.id} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Serial: {checker.serial}</p>
                      <p className="text-xs text-gray-500">PIN: {checker.pin}</p>
                      {checker.assigned_at && (
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Assigned: {new Date(checker.assigned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {checker.waec_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
