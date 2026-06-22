import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Subscriptions require auth to know who is subscribing
router.use(verifyJWT);

// POST /api/v1/subscriptions/c/:channelId -> toggle subscribe
// GET /api/v1/subscriptions/c/:channelId -> get list of subscribers for this channel
router.route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

// GET /api/v1/subscriptions/u/:subscriberId -> get list of channels this user is subscribed to
router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
