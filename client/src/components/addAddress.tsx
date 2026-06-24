import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

// ✅ Define FormData type
type FormData = {
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark: string;
  mobile: string;
  addressType: string;
};

export default function AddressPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    landmark: '',
    mobile: '',
    addressType: 'Home',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.state.trim()) newErrors.state = 'Required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Required';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
    if (!formData.country.trim()) newErrors.country = 'Required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Required';
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Invalid number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    console.log('Address Submitted:', formData);
    setIsModalOpen(false);
    setFormData({
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
      landmark: '',
      mobile: '',
      addressType: 'Home',
    });
    setErrors({});
  };

  const cityStateFields: (keyof FormData)[] = ["city", "state"];
  const pincodeCountryFields: (keyof FormData)[] = [
    "pincode",
    "country",
  ]; 

  return (
    <div className="p-8">
  <button
    onClick={() => setIsModalOpen(true)}
    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
  >
    + Add New Address
  </button>

  <Transition appear show={isModalOpen} as={Fragment}>
    <Dialog
      as="div"
      className="relative z-50"
      onClose={() => setIsModalOpen(false)}
    >
      {/* Overlay */}
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      </Transition.Child>

      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto transform rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl transition-all">

              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>

              {/* Title */}
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-5">
                Add New Address
              </Dialog.Title>

              {/* Form */}
              <div className="space-y-4">

                {/* Address */}
                <div>
                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="Address Line 1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={`w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border ${
                      errors.addressLine1 ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.addressLine1 && (
                    <p className="text-sm text-red-500 mt-1">{errors.addressLine1}</p>
                  )}
                </div>

                {/* City + State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cityStateFields.map((field) => (
                    <div key={field}>
                      <input
                        type="text"
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={handleChange}
                        className={`w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border ${
                          errors[field] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors[field] && (
                        <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pincode + Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pincodeCountryFields.map((field) => (
                    <div key={field}>
                      <input
                        type="text"
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={handleChange}
                        className={`w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border ${
                          errors[field] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors[field] && (
                        <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Landmark */}
                <input
                  type="text"
                  name="landmark"
                  placeholder="Landmark (optional)"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Mobile */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-300">+91</span>
                  <div className="w-full">
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Mobile Number"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`w-full rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border ${
                        errors.mobile ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.mobile && (
                      <p className="text-sm text-red-500 mt-1">{errors.mobile}</p>
                    )}
                  </div>
                </div>

                {/* Address Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address Type:
                  </label>
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleChange}
                    className="w-full sm:w-40 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition shadow"
                  onClick={handleSubmit}
                >
                  Save Address
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
</div>
  );
}
