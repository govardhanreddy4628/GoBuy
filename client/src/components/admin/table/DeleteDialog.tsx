import { useState } from "react";
import { toast } from "../../../hooks/use-toast";
import { useAuth } from "../../../context/authContext"; // ✅ add this
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../ui/alert-dialog";
import { POST } from "../../../api/api_utility";

interface DeleteDialogProps {
  trigger: React.ReactNode;
  selectedIds: (string | number)[];
  resourceName?: string;
  onDeleted?: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  trigger,
  selectedIds,
  resourceName = "customer(s)",
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // ✅ get user

  const handleDelete = async () => {
    // // 🚫 ROLE CHECK
    // if (user?.role !== "SUPER-ADMIN") {
    //   toast({
    //     title: "Access Denied",
    //     description: "Only super admin can delete the customers",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    if (!selectedIds.length) {
      toast({
        title: "Nothing selected",
        description: `Please select at least one ${resourceName} before deleting.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await POST("/api/customers/delete", {
        ids: selectedIds,
      });

      console.log("DELETE RESPONSE:", res.data);

      toast({
        title: "Deleted successfully",
        description: `Removed ${selectedIds.length} ${resourceName}.`,
      });

      onDeleted?.(); // ✅ trigger refresh
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err?.response?.data?.message || "Delete failed", 
          variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedIds.length}</span>{" "}
            {resourceName}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;