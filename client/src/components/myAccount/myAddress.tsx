import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { ShippingForm } from "../../components/checkout/ShippingForm";
import { SavedAddresses } from "../../components/checkout/SavedAddresses";
import api from "../../api/api_utility";
import { useAuth } from "../../context/authContext";
import { ShippingDetails, ShippingFormValues } from "../../pages/Checkout";


const MyAddress = () => {
  const { isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState<ShippingDetails[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // ================= FETCH ADDRESSES =================
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAddresses = async () => {
      try {
        const res = await api.get("/api/v1/address/get");
        const data = res.data.data || [];
        setAddresses(data);
      } catch (error) {
        toast({ title: "Failed to load addresses" });
        console.error(error);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  // ================= ADD / UPDATE =================
  const handleSubmit = async (data: ShippingFormValues) => {
    try {
      setLoading(true);

      if (editingAddress) {
        const res = await api.put(
          `/api/v1/address/edit/${editingAddress._id}`,
          data
        );

        const updated = res.data.data;

        setAddresses((prev) =>
          prev.map((a) => (a._id === editingAddress._id ? updated : a))
        );

        toast({ title: "Address updated successfully" });
      } else {
        const res = await api.post("/api/v1/address/add", data);
        const newAddress = res.data.data;

        setAddresses((prev) => [newAddress, ...prev]);

        toast({ title: "Address added successfully" });
      }

      setEditingAddress(null);
      setShowForm(false);
    } catch (error) {
      toast({ title: "Something went wrong" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/v1/address/delete/${id}`);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast({ title: "Address deleted" });
    } catch {
      toast({ title: "Failed to delete address" });
    }
  };

  const handleEdit = (address: ShippingDetails) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">My Addresses</h1>

      <Card className="p-6 space-y-4">
        <SavedAddresses
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={setSelectedAddressId}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {!showForm && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        )}

        {showForm && (
          <>
            <Separator className="my-4" />
            <ShippingForm
              onSubmit={handleSubmit}
              loading={loading}
              onCancel={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
              defaultValues={editingAddress || undefined}
              isEdit={!!editingAddress}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default MyAddress;