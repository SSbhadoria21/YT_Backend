import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/Video.model.js"
import {User} from "../models/User.model.js"
import {apiError} from "../utils/apiError.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadonCloudinary} from "../utils/Cloudinary.js"

// We are defining the getAllVideos controller to fetch videos based on queries
const getAllVideos = asyncHandler(async (req, res) => {
    // Extract query parameters from req.query (defaulting page to 1 and limit to 10)
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Initialize pipeline array for MongoDB aggregation
    const pipeline = [];

    // If a search query is provided, add a $match stage to search in title and description
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    // If a specific userId is provided, filter videos by that user
    if (userId) {
        // Validate the userId format to prevent errors
        if (!isValidObjectId(userId)) {
            throw new apiError(400, "Invalid user ID");
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // Add a condition to only fetch published videos (we don't want to show private ones)
    pipeline.push({
        $match: {
            isPublished: true
        }
    });

    // Add a sorting stage based on sortBy and sortType
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        // Default sorting by creation date in descending order (newest first)
        pipeline.push({
            $sort: {
                createdAt: -1
            }
        });
    }

    // Lookup to get owner details (username, avatar) for each video
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        avatar: 1
                    }
                }
            ]
        }
    });

    // Unwind the ownerDetails array to an object so that frontend gets a clean object
    pipeline.push({
        $unwind: "$ownerDetails"
    });

    // We use mongooseAggregatePaginate on the video model and pass our pipeline
    const videoAggregate = Video.aggregate(pipeline);
    
    // Define options for pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    // Execute aggregation query with pagination
    const video = await Video.aggregatePaginate(videoAggregate, options);

    // Return the fetched videos as JSON response with success status
    return res.status(200).json(new Apiresponse(200, video, "Videos fetched successfully"));
});

// We are defining the publishAVideo controller to upload and save a new video
const publishAVideo = asyncHandler(async (req, res) => {
    // Extract title and description from the request body
    const { title, description } = req.body;

    // Check if title or description is missing
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    // Extract the local path of the video file from req.files
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    // Extract the local path of the thumbnail image from req.files
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    // Check if video file is missing
    if (!videoFileLocalPath) {
        throw new apiError(400, "Video file is required");
    }
    // Check if thumbnail file is missing
    if (!thumbnailLocalPath) {
        throw new apiError(400, "Thumbnail is required");
    }

    // Upload the video file to Cloudinary
    const videoFile = await uploadonCloudinary(videoFileLocalPath);
    // Upload the thumbnail image to Cloudinary
    const thumbnail = await uploadonCloudinary(thumbnailLocalPath);

    // If uploading the video fails, throw an error
    if (!videoFile) {
        throw new apiError(400, "Error uploading video file");
    }
    // If uploading the thumbnail fails, throw an error
    if (!thumbnail) {
        throw new apiError(400, "Error uploading thumbnail");
    }

    // Create a new video document in the database
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        // The duration is provided by Cloudinary upon video upload
        duration: videoFile.duration,
        owner: req.user._id, // Assign the currently logged-in user as the owner
        isPublished: true // Set the video to published by default
    });

    // Fetch the newly created video from DB
    const videoUploaded = await Video.findById(video._id);

    // If DB creation fails, throw error
    if (!videoUploaded) {
        throw new apiError(500, "Video upload failed");
    }

    // Return the response with created video details
    return res.status(200).json(new Apiresponse(200, videoUploaded, "Video published successfully"));
});

// Controller to get a specific video by its ID
const getVideoById = asyncHandler(async (req, res) => {
    // Extract the video ID from request parameters
    const { videoId } = req.params;

    // Validate if the ID is a valid MongoDB ObjectID
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    // Build aggregation pipeline to get video details along with owner information and likes count
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            // Join with users collection to get owner details
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        // Select only needed fields from user
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
            // Join with likes collection to count the total likes on this video
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            // Join with subscriptions to get subscriber details for the video owner
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            // Add custom fields like owner object, likes count, and whether current user liked it
            $addFields: {
                owner: {
                    $first: "$owner"
                },
                likesCount: {
                    $size: "$likes"
                },
                isLiked: {
                    $cond: {
                        // Check if current user's ID exists in the likes array
                        if: { $in: [req.user?._id, "$likes.LikedBy"] },
                        then: true,
                        else: false
                    }
                },
                subscribersCount: {
                    $size: "$subscribers"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            // Remove the big arrays from the final response object for performance
            $project: {
                likes: 0,
                subscribers: 0
            }
        }
    ]);

    // Check if the video exists
    if (!video?.length) {
        throw new apiError(404, "Video not found");
    }

    // Increment the views of the video by 1 since someone is fetching it
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    });

    // Return the response with video data
    return res.status(200).json(new Apiresponse(200, video[0], "Video fetched successfully"));
});

// Controller to update video details (title, description, thumbnail)
const updateVideo = asyncHandler(async (req, res) => {
    // Extract video ID from URL
    const { videoId } = req.params;
    // Extract new title and description from body
    const { title, description } = req.body;

    // Validate the ID
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    // Make sure title or description is provided
    if (!title && !description) {
        throw new apiError(400, "Title or description is required");
    }

    // Check if a new thumbnail file is uploaded
    const thumbnailLocalPath = req.file?.path;

    let thumbnailUrl;
    // If a new thumbnail is provided, upload it to Cloudinary
    if (thumbnailLocalPath) {
        const thumbnail = await uploadonCloudinary(thumbnailLocalPath);
        if (!thumbnail) {
            throw new apiError(400, "Error uploading thumbnail");
        }
        thumbnailUrl = thumbnail.url;
    }

    // Build the update object dynamically based on provided fields
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (thumbnailUrl) updateFields.thumbnail = thumbnailUrl;

    // Find the video and update it. Ensure we only update if owner matches req.user._id (security check)
    const video = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        {
            $set: updateFields
        },
        { new: true } // Return the updated document
    );

    // If no video is found or the user is not owner
    if (!video) {
        throw new apiError(404, "Video not found or unauthorized");
    }

    // Return the updated video
    return res.status(200).json(new Apiresponse(200, video, "Video updated successfully"));
});

// Controller to delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    // Get the video ID from parameters
    const { videoId } = req.params;

    // Validate ID
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    // Find and delete the video (only if the user is the owner)
    const video = await Video.findOneAndDelete({ _id: videoId, owner: req.user._id });

    // If video is not found or not owned by user
    if (!video) {
        throw new apiError(404, "Video not found or unauthorized");
    }

    // Return a success message
    return res.status(200).json(new Apiresponse(200, {}, "Video deleted successfully"));
});

// Controller to toggle the publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    // Get video ID from URL parameters
    const { videoId } = req.params;

    // Validate ID
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }

    // Fetch the video to check its current status and ensure ownership
    const video = await Video.findOne({ _id: videoId, owner: req.user._id });

    // If not found or unauthorized
    if (!video) {
        throw new apiError(404, "Video not found or unauthorized");
    }

    // Flip the boolean value of isPublished (if true make false, if false make true)
    video.isPublished = !video.isPublished;
    // Save the updated document in the database
    await video.save({ validateBeforeSave: false });

    // Return success response
    return res.status(200).json(new Apiresponse(200, video, "Video publish status updated"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
