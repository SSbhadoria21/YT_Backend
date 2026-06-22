import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Liking requires the user to be authenticated, so apply verifyJWT
router.use(verifyJWT);

// POST /api/v1/likes/toggle/v/:videoId
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// POST /api/v1/likes/toggle/c/:commentId
router.route("/toggle/c/:commentId").post(toggleCommentLike);

// POST /api/v1/likes/toggle/t/:tweetId
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

// GET /api/v1/likes/videos
router.route("/videos").get(getLikedVideos);

export default router;
