
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Calendar, Package } from 'lucide-react';

interface Order {
  id: string;
  waecType: string;
  quantity: number;
  phone: string;
  email: string;
  paid: boolean;
  date: string;
  status: 'pending' | 'completed' | 'processing';
}

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailModal = ({ order, isOpen, onClose }: OrderDetailModalProps) => {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrice = (type: string) => {
    switch (type) {
      case 'BECE': return 50;
      case 'WASSCE': return 75;
      case 'NOVDEC': return 60;
      default: return 0;
    }
  };

  const totalAmount = order.quantity * getPrice(order.waecType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Details - {order.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Payment</span>
            <Badge className={order.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {order.paid ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Package className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{order.waecType}</p>
                <p className="text-xs text-gray-500">Quantity: {order.quantity}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <p className="text-sm">{order.phone}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <p className="text-sm">{order.email}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <p className="text-sm">{new Date(order.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Amount</span>
              <span className="text-lg font-bold text-gray-900">₵{totalAmount}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
