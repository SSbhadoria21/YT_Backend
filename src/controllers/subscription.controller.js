import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/User.model.js"
import {Subscription} from "../models/Subscriptions.model.js"
import {apiError} from "../utils/apiError.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Controller to toggle subscription (subscribe or unsubscribe) to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    // Extract channelId from parameters
    const {channelId} = req.params;

    // Validate the channel ID
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }

    // A user shouldn't be able to subscribe to their own channel
    if (channelId === req.user._id.toString()) {
        throw new apiError(400, "You cannot subscribe to your own channel");
    }

    // Check if the current user has already subscribed to this channel
    const existingSub = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (existingSub) {
        // If the subscription exists, we delete it (Unsubscribe)
        await Subscription.findByIdAndDelete(existingSub._id);
        return res.status(200).json(new Apiresponse(200, { subscribed: false }, "Unsubscribed successfully"));
    } else {
        // If it doesn't exist, we create it (Subscribe)
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
        return res.status(200).json(new Apiresponse(200, { subscribed: true }, "Subscribed successfully"));
    }
});

// Controller to return the list of users who have subscribed to a given channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // Extract channel ID from parameters
    const {channelId} = req.params;

    // Validate the ID
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channel ID");
    }

    // Use aggregation to find all subscriptions matching the channel ID and join user info
    const subscribers = await Subscription.aggregate([
        {
            // Match the target channel
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            // Join with users collection to pull the subscriber's info
            $lookup: {
                from: "users",
                localField: "subscriber", // The field in Subscription model
                foreignField: "_id",      // The field in User model
                as: "subscriberDetails",
                pipeline: [
                    {
                        // Project only needed details to keep response light
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            // Unwind the subscriberDetails array into an object
            $unwind: "$subscriberDetails"
        },
        {
            // Send back only the subscriberDetails
            $project: {
                subscriberDetails: 1
            }
        }
    ]);

    // Return the response with fetched list
    return res.status(200).json(new Apiresponse(200, subscribers, "Subscribers fetched successfully"));
});

// Controller to return the list of channels a given user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // Extract subscriber ID
    const { subscriberId } = req.params;

    // Validate ID
    if (!isValidObjectId(subscriberId)) {
        throw new apiError(400, "Invalid subscriber ID");
    }

    // Use aggregation to find all channels this user is subscribed to
    const subscribedChannels = await Subscription.aggregate([
        {
            // Match the subscriber ID
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            // Join with users collection to pull the channel's info
            $lookup: {
                from: "users",
                localField: "channel", // The field in Subscription model
                foreignField: "_id",   // The field in User model
                as: "channelDetails",
                pipeline: [
                    {
                        // Select necessary fields
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            // Unwind the channelDetails array into an object
            $unwind: "$channelDetails"
        },
        {
            // Keep only the channel details
            $project: {
                channelDetails: 1
            }
        }
    ]);

    // Return the successfully fetched channels list
    return res.status(200).json(new Apiresponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
