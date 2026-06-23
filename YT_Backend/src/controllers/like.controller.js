import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Controller to toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    // Extract video ID from URL parameters
    const {videoId} = req.params;

    // Validate if the ID is a valid MongoDB ObjectID
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    // Check if the current user has already liked this video
    // The field in DB is LikedBy (capital L)
    const existingLike = await Like.findOne({
        video: videoId,
        LikedBy: req.user._id
    });

    if (existingLike) {
        // If the like exists, delete it (unlike the video)
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new Apiresponse(200, { liked: false }, "Video unliked successfully"));
    } else {
        // If the like does not exist, create a new document (like the video)
        await Like.create({
            video: videoId,
            LikedBy: req.user._id
        });
        return res.status(200).json(new Apiresponse(200, { liked: true }, "Video liked successfully"));
    }
});

// Controller to toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    // Extract comment ID from URL
    const {commentId} = req.params;

    // Validate the ID
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }

    // Check if the user has already liked the comment
    const existingLike = await Like.findOne({
        comment: commentId,
        LikedBy: req.user._id
    });

    if (existingLike) {
        // If the user already liked it, remove the like
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new Apiresponse(200, { liked: false }, "Comment unliked successfully"));
    } else {
        // Otherwise, add a new like
        await Like.create({
            comment: commentId,
            LikedBy: req.user._id
        });
        return res.status(200).json(new Apiresponse(200, { liked: true }, "Comment liked successfully"));
    }
});

// Controller to toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    // Extract tweet ID from URL
    const {tweetId} = req.params;

    // Validate the ID
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet ID");
    }

    // Check existing like on the tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        LikedBy: req.user._id
    });

    if (existingLike) {
        // Remove like if it exists
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new Apiresponse(200, { liked: false }, "Tweet unliked successfully"));
    } else {
        // Create new like if it doesn't exist
        await Like.create({
            tweet: tweetId,
            LikedBy: req.user._id
        });
        return res.status(200).json(new Apiresponse(200, { liked: true }, "Tweet liked successfully"));
    }
});

// Controller to fetch all videos liked by the current user
const getLikedVideos = asyncHandler(async (req, res) => {
    // Fetch likes from DB where LikedBy is the current user and the video field exists (is not null)
    const likedVideos = await Like.aggregate([
        {
            $match: {
                LikedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null }
            }
        },
        {
            // Join with the videos collection to get video details
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        // Also populate the owner of each liked video so UI can show channel info
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
                        $unwind: "$ownerDetails" // Flatten the owner details array
                    }
                ]
            }
        },
        {
            $unwind: "$videoDetails" // Flatten the video details array
        },
        {
            $sort: {
                createdAt: -1 // Sort by most recently liked first
            }
        },
        {
            // Project only the video details in the final response
            $project: {
                videoDetails: 1
            }
        }
    ]);

    // Return the results
    return res.status(200).json(new Apiresponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
