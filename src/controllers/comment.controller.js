import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Controller to get all comments of a particular video
const getVideoComments = asyncHandler(async (req, res) => {
    // Extract video ID from parameters and pagination values from query
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    // Validate the video ID
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    // Build the aggregation pipeline for fetching comments
    const pipeline = [
        {
            // Match comments for the specific video
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            // Join with users collection to get the commenter's details
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        // Project only necessary fields of the user
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
            $unwind: "$ownerDetails" // Flatten the owner array into an object
        },
        {
            $sort: {
                createdAt: -1 // Display newest comments first
            }
        }
    ];

    // Setup options for mongooseAggregatePaginate
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    // Execute paginated aggregation using the plugin
    const commentsAggregate = Comment.aggregate(pipeline);
    const comments = await Comment.aggregatePaginate(commentsAggregate, options);

    // Return successfully with paginated data
    return res.status(200).json(new Apiresponse(200, comments, "Comments fetched successfully"));
});

// Controller to add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    // Extract video ID from params and comment content from the request body
    const {videoId} = req.params;
    const {content} = req.body;

    // Validate inputs
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }
    if (!content || content.trim() === "") {
        throw new apiError(400, "Comment content is required");
    }

    // Create a new comment document in the database
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id // The owner is the currently logged-in user
    });

    // If something goes wrong while creating the comment
    if (!comment) {
        throw new apiError(500, "Failed to add comment");
    }

    // Return the newly created comment
    return res.status(200).json(new Apiresponse(200, comment, "Comment added successfully"));
});

// Controller to update a comment's content
const updateComment = asyncHandler(async (req, res) => {
    // Extract comment ID and new content
    const {commentId} = req.params;
    const {content} = req.body;

    // Validate inputs
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }
    if (!content || content.trim() === "") {
        throw new apiError(400, "Content is required");
    }

    // Find and update the comment, ensuring the user requesting this is the actual owner
    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },
        {
            $set: { content }
        },
        { new: true } // Return the updated document instead of the old one
    );

    // If the comment doesn't exist or the user isn't the owner
    if (!comment) {
        throw new apiError(404, "Comment not found or unauthorized");
    }

    // Return success
    return res.status(200).json(new Apiresponse(200, comment, "Comment updated successfully"));
});

// Controller to delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    // Extract comment ID
    const {commentId} = req.params;

    // Validate the ID
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }

    // Delete comment ensuring ownership
    const comment = await Comment.findOneAndDelete({ _id: commentId, owner: req.user._id });

    // If it fails (either because it doesn't exist or user isn't the owner)
    if (!comment) {
        throw new apiError(404, "Comment not found or unauthorized");
    }

    // Return success with empty object
    return res.status(200).json(new Apiresponse(200, {}, "Comment deleted successfully"));
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
