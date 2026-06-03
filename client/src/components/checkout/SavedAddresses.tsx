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
      <h3 className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Saved Addresses
      </h3>

      <RadioGroup
        value={selectedAddressId || ""}
        onValueChange={onSelectAddress}
        className="space-y-3"
      >
        {addresses.map((address) => (
          <Card
            key={address._id}
            className={`p-4 transition-all ${
              selectedAddressId === address._id
                ? "border-red-500 shadow-md"
                : "hover:shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <RadioGroupItem
                  value={address._id}
                  id={address._id}
                />

                <Label
                  htmlFor={address._id}
                  className="cursor-pointer"
                >
                  <p className="font-medium">
                    {address.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.address_line}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} -{" "}
                    {address.pincode}
                  </p>
                </Label>
              </div>

              {/* ICON ACTIONS */}
              <div className="flex gap-1">
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // prevents radio select
                      onEdit(address);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // prevents radio select
                      onDelete(address._id);
                    }}
                  >
                    <DeleteIcon
                      fontSize="small"
                      color="error"
                    />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
};