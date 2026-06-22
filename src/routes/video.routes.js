import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

// Initialize express router
const router = Router();

// Apply verifyJWT middleware to all routes in this file since they require authentication
router.use(verifyJWT);

// Route for getting all videos and publishing a new video
// GET /api/v1/videos/ -> getAllVideos
// POST /api/v1/videos/ -> publishAVideo (uses multer to accept video and thumbnail files)
router.route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 }
        ]),
        publishAVideo
    );

// Routes for specific video operations based on videoId
// GET /api/v1/videos/:videoId -> fetch a specific video
// DELETE /api/v1/videos/:videoId -> delete a specific video
// PATCH /api/v1/videos/:videoId -> update a video's details (accepts new thumbnail)
router.route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

// Route to toggle publish status
// PATCH /api/v1/videos/toggle/publish/:videoId -> switches the boolean flag
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
