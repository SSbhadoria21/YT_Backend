import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Ensure the user is logged in to view their dashboard
router.use(verifyJWT);

// GET /api/v1/dashboard/stats -> fetches channel stats
router.route("/stats").get(getChannelStats);

// GET /api/v1/dashboard/videos -> fetches channel videos
router.route("/videos").get(getChannelVideos);

export default router;
