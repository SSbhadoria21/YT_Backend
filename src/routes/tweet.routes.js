import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Apply verifyJWT to all routes because tweets involve user actions
router.use(verifyJWT);

// GET /api/v1/tweets/user/:userId -> fetch all tweets of a user
// POST /api/v1/tweets/ -> create a new tweet
router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);

// PATCH /api/v1/tweets/:tweetId -> update a tweet
// DELETE /api/v1/tweets/:tweetId -> delete a tweet
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
