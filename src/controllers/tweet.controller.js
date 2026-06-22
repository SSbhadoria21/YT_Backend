import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/User.model.js"
import {apiError} from "../utils/apiError.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Controller to create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    // Extract content from request body
    const { content } = req.body;

    // Check if content is provided
    if (!content || content.trim() === "") {
        throw new apiError(400, "Content is required");
    }

    // Create the tweet in the database
    const tweet = await Tweet.create({
        content,
        owner: req.user._id // The owner is the currently authenticated user
    });

    // If something goes wrong during creation
    if (!tweet) {
        throw new apiError(500, "Failed to create tweet");
    }

    // Send success response with the created tweet
    return res.status(200).json(new Apiresponse(200, tweet, "Tweet created successfully"));
});

// Controller to get all tweets of a specific user
const getUserTweets = asyncHandler(async (req, res) => {
    // Extract user ID from parameters
    const { userId } = req.params;

    // Validate the ID
    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user ID");
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new apiError(404, "User not found");
    }

    // Fetch tweets matching the user ID and populate owner details (username, avatar)
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            // Join with users collection
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails" // Flatten the array to an object
        },
        {
            $sort: {
                createdAt: -1 // Sort by newest first
            }
        }
    ]);

    // Return the array directly, even if it's empty (no tweets yet)
    return res.status(200).json(new Apiresponse(200, tweets, "User tweets fetched successfully"));
});

// Controller to update an existing tweet
const updateTweet = asyncHandler(async (req, res) => {
    // Extract tweet ID from parameters
    const { tweetId } = req.params;
    // Extract new content from body
    const { content } = req.body;

    // Validate inputs
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
    }
    if (!content || content.trim() === "") {
        throw new apiError(400, "Content is required");
    }

    // Find the tweet and ensure the user owns it before updating
    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: req.user._id },
        {
            $set: { content } // Update the content
        },
        { new: true } // Return the updated document
    );

    // If not found or not owner
    if (!tweet) {
        throw new apiError(404, "Tweet not found or unauthorized");
    }

    // Return the updated tweet
    return res.status(200).json(new Apiresponse(200, tweet, "Tweet updated successfully"));
});

// Controller to delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
    // Extract tweet ID from parameters
    const { tweetId } = req.params;

    // Validate the ID
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
    }

    // Find and delete the tweet ensuring the user owns it
    const tweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: req.user._id });

    // If not found or not owner
    if (!tweet) {
        throw new apiError(404, "Tweet not found or unauthorized");
    }

    // Return a success response
    return res.status(200).json(new Apiresponse(200, {}, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
