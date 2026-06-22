import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Apply verifyJWT to all comment routes because commenting requires the user to be logged in
router.use(verifyJWT);

// GET /api/v1/comments/:videoId -> get all comments for a video
// POST /api/v1/comments/:videoId -> add a comment to a video
router.route("/:videoId").get(getVideoComments).post(addComment);

// PATCH /api/v1/comments/c/:commentId -> update an existing comment
// DELETE /api/v1/comments/c/:commentId -> delete an existing comment
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
