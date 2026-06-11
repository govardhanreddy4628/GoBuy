import { MapPin } from "lucide-react";
import { ShippingDetails } from "../../pages/Checkout";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Card } from "../../ui/card";
import { Label } from "../../ui/label";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface SavedAddressesProps {
  addresses: ShippingDetails[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (address: ShippingDetails) => void;
}

export const SavedAddresses = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onDelete,
  onEdit,
}: SavedAddressesProps) => {
  if (!addresses.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <MapPin className="h-4 w-4" />
        Saved Addresses
      </h3>

      <RadioGroup
        value={selectedAddressId || ""}
        onValueChange={onSelectAddress}
        className="space-y-3"
      >
        {addresses.map((address) => {
          const isActive = selectedAddressId === address._id;

          return (
            <Card
              key={address._id}
              className={`p-4 transition-all border relative
            bg-white dark:bg-gray-900
            border-gray-200 dark:border-gray-700
            ${isActive
                  ? "border-red-500 shadow-md"
                  : "hover:shadow-sm"
                }`}
            >
              {/* TOP ROW */}
              <div className="flex justify-between items-start">

                {/* LEFT (RADIO + TEXT) */}
                <div className="flex gap-3">
                  <RadioGroupItem
                    value={address._id}
                    id={address._id}
                    className="
    mt-1
    border-gray-600
    text-red-500
    data-[state=checked]:border-red-500
    dark:border-gray-400
  "
                  />

                  <Label
                    htmlFor={address._id}
                    className="cursor-pointer text-sm"
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {address.fullName}
                    </p>

                    <p className="text-gray-600 dark:text-gray-400">
                      {address.address_line}
                    </p>

                    <p className="text-gray-600 dark:text-gray-400">
                      {address.city}, {address.state} -{" "}
                      {address.pincode}
                    </p>
                  </Label>
                </div>

                {/* RIGHT ICONS (FIXED ALIGNMENT) */}
                <div className="flex gap-1 shrink-0">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      className="text-gray-500 dark:text-gray-300 hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(address);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      className="text-gray-500 dark:text-gray-300 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(address._id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
};