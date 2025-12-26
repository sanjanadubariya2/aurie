import express from "express";
import { createOrder, verifyPayment, handlePaymentFailure, createUPIOrder, getPaymentDetails } from "../controllers/paymentController.js";

const router = express.Router();

// Card & Wallet Payments
router.post("/create", createOrder);
router.post("/verify", verifyPayment);
router.post("/failure", handlePaymentFailure);

// UPI Payments
router.post("/upi/create", createUPIOrder);
router.get("/details/:paymentId", getPaymentDetails);

export default router;
