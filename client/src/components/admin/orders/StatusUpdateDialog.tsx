import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Button } from '../../../ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { useState } from "react";
import { OrderStatus } from '../types/order';


interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: OrderStatus;
  orderId: string;
  onUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

export const StatusUpdateDialog = ({
  open,
  onOpenChange,
  currentStatus,
  orderId,
  onUpdate,
}: StatusUpdateDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);

  const handleUpdate = () => {
    onUpdate(orderId, selectedStatus);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status for order #{orderId}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {[
                "created",
                "confirmed",
                "packed",
                "ready_to_ship",
                "shipped",
                "in_transit",
                "out_for_delivery",
                "delivered",
                "cancelled",
                "returned",
                "refunded",
              ].map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
