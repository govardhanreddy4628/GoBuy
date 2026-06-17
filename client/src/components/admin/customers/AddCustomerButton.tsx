import React from "react";
import { FaPlus } from "react-icons/fa6";
import { Customer } from "./customersData"; // ✅ Adjust the import path if needed

interface AddCustomerButtonProps {
  setShowModal: (show: boolean) => void;
  setActionType: (type: 'add' | 'edit' | 'view' | null) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
}

const AddCustomerButton: React.FC<AddCustomerButtonProps> = ({ setShowModal, setActionType, setSelectedCustomer }) => {

  const handleAddCustomer = () => {
    setActionType('add');
    setSelectedCustomer(null);
    setShowModal(true);
  };

  return (
    <button
      onClick={handleAddCustomer}
      className="px-4 py-1.5 bg-blue-600 text-white rounded flex gap-2 items-center hover:bg-blue-700 transition-colors"
    >
      <FaPlus />
      <span>Add Customer</span>
    </button>
  );
};

export default AddCustomerButton;
