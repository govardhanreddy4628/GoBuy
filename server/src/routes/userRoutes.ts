// --- src/routes/auth.routes.ts ---
import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  loginController,
  logoutController,
  getNewAccessToken,
  registerController,
  verifyEmailController,
  removeImgFromCloudinary,
  userAvatarController,
  forgotPasswordController,
  getCurrentUserController,
  resendOtpController,
  refreshController,
  getCustomers,
  updateProfile,
  deleteCustomers,
} from "../controllers/userController.js";
import { uploadSingle } from "../middleware/multer.js";
import { acceptInviteController, inviteAdminController, resendInviteController, revokeInviteController } from "../controllers/adminController.js";
import { requireSuperAdmin } from "../middleware/requireSuperAdmin.js";

const router = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post("/register", uploadSingle, registerController);
router.post("/verify-email", verifyEmailController);
router.post("/resend-otp", asyncHandler(resendOtpController));
router.post("/login", loginController);
router.post("/logout", asyncHandler(logoutController));
router.get("/me", authenticate(), asyncHandler(getCurrentUserController));
router.get("/auth/refresh", asyncHandler(refreshController))
//router.get("/auth/refresh", authenticate(), asyncHandler(getNewAccessToken));
// router.put('/user-avatar', auth, upload.array('avatar'), userAvatarController)   // the name(avatar) should match the name in the frontend form and in database
router.delete("/deleteImage", authenticate(), asyncHandler(removeImgFromCloudinary));
router.get("/customers", getCustomers);
router.post("/delete", asyncHandler(deleteCustomers));
router.put("/update-profile", authenticate(), updateProfile)
// router.put(':/id', authorize, updateUserDetails)
// router.post('/refresh-token', refreshTokenController);

// router.post('forgot-password', forgotPasswordController);
// router.post('verify-forgot-password-otp', verifyForgotPasswordOtpController);
// router.post('reset-password', resetPasswordController);

// router.post("/mfa/generate", authenticate, authorize("ADMIN", "SUPER-ADMIN"), mfaGenerate);
// router.post("/mfa/verify-setup", authenticate, authorize("ADMIN", "SUPER-ADMIN"), mfaVerifySetup);
// router.post("/mfa/disable", authenticate, authorize("ADMIN", "SUPER-ADMIN"), mfaDisable);

// router.get('/admin-data', authorize('ADMIN'), (req, res) => {
//   res.json({ msg: 'Confidential Admin Info' });
// });



router.post("/admin/invite", authenticate(), requireSuperAdmin(), asyncHandler(inviteAdminController));
router.post("/admin/accept-invite", asyncHandler(acceptInviteController));
router.post("/admin/invite/resend", authenticate(), requireSuperAdmin(), asyncHandler(resendInviteController));
router.post("/admin/invite/revoke", authenticate(), requireSuperAdmin(), asyncHandler(revokeInviteController));

export default router;
