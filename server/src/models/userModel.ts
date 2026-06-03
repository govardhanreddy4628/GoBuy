import mongoose, { Document } from "mongoose";

interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: number;

  authProvider: "custom" | "google";
  googleId?: string | null;

  isVerified: boolean;

  role: "USER" | "ADMIN" | "SUPER-ADMIN" | "VENDOR";
  isDemo: boolean;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  otp?: string | null;
  otpExpiresAt?: Date | null;

  avatar: string;
  last_login_date?: Date;

  address_details?: mongoose.Types.ObjectId[];
  shopping_cart?: mongoose.Types.ObjectId[];
  recentlyViewed?: mongoose.Types.ObjectId[];
  orderHistory?: mongoose.Types.ObjectId[];

  tempMFASecret?: string | null;

  mfa?: {
    enabled: boolean;
    secret: string | null;
    backupCodes: string[];
    verified: boolean;
  };
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    fullName: { type: String },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    phoneNumber: {
      type: Number,
      default: null,
    },

    authProvider: { type: String, enum: ["custom", "google"], required: true },
    googleId: { type: String, default: null },

    isVerified: {
      type: Boolean,
      default: false,
    },

    last_login_date: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    address_details: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "address",
      },
    ],

    shopping_cart: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "cart",
      },
    ],

    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    orderHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "order",
      },
    ],

    otp: {
      type: String,
      default: null,
      select: false,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    role: {
      type: String,
      enum: ["ADMIN", "USER", "SUPER-ADMIN", "VENDOR"],
      default: "USER",
    },

    isDemo: {
      type: Boolean,
      default: false,
    },

    tempMFASecret: {
      type: String,
      default: null,
      select: false,
    },

    mfa: {
      enabled: { type: Boolean, default: false },
      secret: { type: String, default: null }, // encrypted base32 secret
      backupCodes: [{ type: String }], // hashed codes
      verified: { type: Boolean, default: false }, // during first setup
    },
  },
  { timestamps: true },
);

// Virtual ID
userSchema.virtual("id").get(function () {
  return this._id;
});

// toJSON Modifier
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const UserModel = mongoose.model<IUserDocument>("User", userSchema);
export default UserModel;




















// // userModel for chat application

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     phoneNumber: { type: String, unique: true, required: true },

//     name: { type: String },
//     about: { type: String, default: "Hey there! I am using WhatsApp." },

//     profilePic: {
//       url: String,
//       public_id: String,
//     },

//     lastSeen: { type: Date },
//     isOnline: { type: Boolean, default: false },

//     statusPrivacy: {
//       type: String,
//       enum: ["everyone", "contacts", "nobody"],
//       default: "everyone",
//     },

//     lastSeenPrivacy: {
//       type: String,
//       enum: ["everyone", "contacts", "nobody"],
//       default: "everyone",
//     },

//     readReceipts: { type: Boolean, default: true },

//     blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

//     contacts: [
//       {
//         user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         name: String,
//       },
//     ],

//     deviceInfo: [
//       {
//         deviceId: String,
//         platform: String,
//         lastActive: Date,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);