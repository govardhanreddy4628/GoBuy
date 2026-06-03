import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from "../models/userModel.js";

dotenv.config();

const users = [
  { fullName: "Karthik Reddy", email: "karthik.reddy@gmail.com", phoneNumber: 9345678123, role: "USER", status: "ACTIVE" },
  { fullName: "Rahul Sharma", email: "rahul.sharma@gmail.com", phoneNumber: 9876543210, role: "USER", status: "ACTIVE" },
  { fullName: "Priya Reddy", email: "priya.reddy@gmail.com", phoneNumber: 9123456780, role: "USER", status: "ACTIVE" },
  { fullName: "Arjun Patel", email: "arjun.patel@gmail.com", phoneNumber: 9988776655, role: "USER", status: "ACTIVE" },
  { fullName: "Sneha Gupta", email: "sneha.gupta@gmail.com", phoneNumber: 9012345678, role: "USER", status: "SUSPENDED" },

  { fullName: "Admin User", email: "admin@explorer.com", phoneNumber: 9000000001, role: "ADMIN", status: "ACTIVE", isDemo: true },
  { fullName: "Super Admin", email: "superadmin@explorer.com", phoneNumber: 9000000002, role: "SUPER-ADMIN", status: "ACTIVE", isDemo: true },
  { fullName: "Vendor Demo", email: "vendor@explorer.com", phoneNumber: 9000000003, role: "VENDOR", status: "ACTIVE", isDemo: true },

  { fullName: "Amit Verma", email: "amit.verma@gmail.com", phoneNumber: 9876543001, role: "USER", status: "ACTIVE" },
  { fullName: "Neha Singh", email: "neha.singh@gmail.com", phoneNumber: 9876543002, role: "USER", status: "ACTIVE" },
  { fullName: "Rohit Kumar", email: "rohit.kumar@gmail.com", phoneNumber: 9876543003, role: "USER", status: "ACTIVE" },
  { fullName: "Pooja Sharma", email: "pooja.sharma@gmail.com", phoneNumber: 9876543004, role: "USER", status: "ACTIVE" },
  { fullName: "Vikas Yadav", email: "vikas.yadav@gmail.com", phoneNumber: 9876543005, role: "USER", status: "ACTIVE" },
  { fullName: "Ananya Iyer", email: "ananya.iyer@gmail.com", phoneNumber: 9876543006, role: "USER", status: "ACTIVE" },
  { fullName: "Manoj Nair", email: "manoj.nair@gmail.com", phoneNumber: 9876543007, role: "USER", status: "ACTIVE" },
  { fullName: "Kavita Joshi", email: "kavita.joshi@gmail.com", phoneNumber: 9876543008, role: "USER", status: "ACTIVE" },
  { fullName: "Rakesh Mehta", email: "rakesh.mehta@gmail.com", phoneNumber: 9876543009, role: "USER", status: "ACTIVE" },
  { fullName: "Divya Kapoor", email: "divya.kapoor@gmail.com", phoneNumber: 9876543010, role: "USER", status: "ACTIVE" },
];

// date utilities
const START_DATE = new Date("2025-10-08");
const NOW = new Date();

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const seedUsers = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
    if (!process.env.USER_SEED_PASSWORD) throw new Error("USER_SEED_PASSWORD missing");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const hashedPassword = await bcrypt.hash(process.env.USER_SEED_PASSWORD, 10);

    for (const user of users) {
      const exists = await UserModel.findOne({ email: user.email });

      if (!exists) {

        const createdAt = randomDate(START_DATE, NOW);
        const updatedAt = randomDate(createdAt, NOW);
        const lastLogin = randomDate(createdAt, updatedAt);

        await UserModel.create({
          fullName: user.fullName,
          email: user.email,
          password: hashedPassword,

          phoneNumber: user.phoneNumber,
          authProvider: "custom",
          googleId: null,

          isVerified: true,
          role: user.role,
          isDemo: user.isDemo ?? false,
          status: user.status,

          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,

          createdAt,
          updatedAt,
          last_login_date: lastLogin,

          address_details: [],
          shopping_cart: [],
          recentlyViewed: [],
          orderHistory: [],

          otp: null,
          otpExpiresAt: null,

          tempMFASecret: null,

          mfa: {
            enabled: false,
            secret: null,
            backupCodes: [],
            verified: false,
          },
        });

        console.log(`✅ Created: ${user.email}`);
      } else {
        console.log(`⚠️ Already exists: ${user.email}`);
      }
    }

    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");

    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedUsers();