import crypto from "crypto";
import redisClient from "../config/connectRedis.js";


const adminInviteKey = (token: string) => `admin_invite:${token}`;

export async function createAdminInvite({email, role, invitedBy,}: {email: string; role: "ADMIN" | "VENDOR"; invitedBy: string }) {
  const token = crypto.randomBytes(32).toString("hex");

  await redisClient.set(
    adminInviteKey(token),
    JSON.stringify({
      email,
      role,
      invitedBy,
      used: false,
      createdAt: Date.now(),
    }),
    { EX: 60 * 30 }
  );

  return token;
}

export async function getInvite(token: string) {
  const raw = await redisClient.get(adminInviteKey(token));
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function markInviteUsed(token: string) {
  await redisClient.del(adminInviteKey(token));
}
