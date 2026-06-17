import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import React from "react";
import DeleteDialog from "../table/DeleteDialog";
import { Customer } from "../types/customers";

interface ActionsProps {
  cust: Customer;
  setActionType: (type: 'add' | 'edit' | 'view' | null) => void;
  setShowModal: (show: boolean) => void;
  setSelectedCustomer: (customer: Customer) => void;
  onDeleted?: () => void;
}

const Actions: React.FC<ActionsProps> = ({
  cust,
  setActionType,
  setShowModal,
  setSelectedCustomer,
  onDeleted
}) => {
  const handleViewProfile = () => {
    setActionType("view");
    setSelectedCustomer(cust);
    setShowModal(true);
  };

  const handleEditProfile = () => {
    setActionType("edit");
    setSelectedCustomer(cust);
    setShowModal(true);
  };

  return (
    <div className="flex space-x-3 items-center">
      <button
        title="View"
        className="text-green-600 hover:text-green-800"
        aria-label={`View customer ${cust.name}`}
        onClick={handleViewProfile}
      >
        <LuEye className="h-5 w-5" />
      </button>

      <button
        title="Edit"
        className="text-blue-600 hover:text-blue-800"
        aria-label={`Edit customer ${cust.name}`}
        onClick={handleEditProfile}
      >
        <MdOutlineEdit className="h-5 w-5" />
      </button>

      <DeleteDialog
        selectedIds={[cust.id]}
        onDeleted={onDeleted} // ✅ quick fix
        resourceName="customer"
        trigger={
          <button
            title="Delete"
            className="text-red-600 hover:text-red-800 pb-2"
            aria-label={`Delete customer ${cust.name}`}
          >
            <MdDeleteOutline className="h-5 w-5" />
          </button>
        }
      />
    </div>
  );
};

export default Actions;
