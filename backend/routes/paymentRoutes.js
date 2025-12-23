import express from "express";
import { createOrder, verifyPayment, handlePaymentFailure } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify", verifyPayment);
router.post("/failure", handlePaymentFailure);

export default router;
