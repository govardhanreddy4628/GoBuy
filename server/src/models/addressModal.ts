import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    houseNumber: {
      type: String,
      required: true,
    },

    address_line: {
      type: String,
      default: "",
    },

    landmark: {
      type: String,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },

    adress_type: {
      type: String,
      enum: ["home", "office"],
      default: "home",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const addressModel = mongoose.model("address", addressSchema);
export default addressModel;
