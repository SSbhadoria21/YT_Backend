import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller.js"

const router = Router();

// GET /api/v1/healthcheck -> returns { status: 'OK' }
router.route("/").get(healthcheck);

export default router;
