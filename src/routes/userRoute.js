const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { loginLimiter, registerLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

// Admin-only direct user creation — replaces the invite flow
router.post("/create-user", requireAuth, requireAdmin, userController.createUser);


router.post("/login", loginLimiter, userController.loginUser);
router.post("/forgot-password", forgotPasswordLimiter, userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword); // token itself is already a strong secret, less critical to throttle

router.get("/users", requireAuth, userController.getAllUsers);
router.get("/users/me", requireAuth, userController.getMe);
router.patch("/users/me", requireAuth, userController.updateMe);
router.patch("/users/me/password", requireAuth, userController.changePassword);
router.patch("/users/:id/role", requireAuth, requireAdmin, userController.updateUserRole);
router.delete("/users/:id", requireAuth, requireAdmin, userController.deleteUser);

module.exports = router;