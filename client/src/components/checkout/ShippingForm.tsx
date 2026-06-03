import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { ShippingFormValues } from "../../pages/Checkout";
import { RiLoader2Fill } from "react-icons/ri";
import { useAuth } from "../../context/authContext";
import { useEffect } from "react";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  houseNumber: z.string().optional(),
  streetName: z.string().optional(),
  address_line: z.string().min(5, "Address is required"),
  landmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  country: z.string().optional(),
  address_type: z.enum(["home", "office"]),
});

interface ShippingFormProps {
  onSubmit: (data: ShippingFormValues) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
  defaultValues?: Partial<ShippingFormValues>;
  isEdit?: boolean;
}


export const ShippingForm = ({ onSubmit, loading, onCancel, defaultValues, isEdit }: ShippingFormProps) => {
  const { user } = useAuth();

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      houseNumber: "",
      streetName: "",
      address_line: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      address_type: "home",
      ...defaultValues, // allow overriding defaults when editing an address
    },
  });

  useEffect(() => {
    if (user?.email) {
      form.setValue("email", user.email);
    }
  }, [user, form]);

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
      });
    }
  }, [defaultValues, form]);

  const handleCancel = () => {
    form.reset();        // ✅ reset here
    onCancel?.();        // ✅ call parent
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address Type */}
        <FormField
          control={form.control}
          name="address_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Type</FormLabel>
              <FormControl>
                <div className="flex gap-6">
                  {["home", "office"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        value={type}
                        checked={field.value === type}
                        onChange={() => field.onChange(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="houseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House Number</FormLabel>
                <FormControl>
                  <Input placeholder="House No" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="streetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Name</FormLabel>
                <FormControl>
                  <Input placeholder="Street Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address_line"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line</FormLabel>
                <FormControl>
                  <Input placeholder="Address Line" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="landmark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land mark</FormLabel>
                <FormControl>
                  <Input placeholder="Land mark" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Maharashtra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input placeholder="400001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 w-full pt-2">
          {/* Add Address (3 parts) */}
          <Button
            type="submit"
            className="flex-[3] flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <RiLoader2Fill className="h-4 w-4 animate-spin" />
                {isEdit ? "Updating Address..." : "Saving Address..."}
              </>
            ) : (
              isEdit ? "Update Address" : "Save Address"
            )}
          </Button>

          {/* Cancel (1 part) */}
          <Button
            type="button"
            variant="outline"
            className="flex-[1]"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

      </form>
    </Form>
  );
};
