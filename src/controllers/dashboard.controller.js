import mongoose from "mongoose"
import {Video} from "../models/Video.model.js"
import {Subscription} from "../models/Subscriptions.model.js"
import {Like} from "../models/like.model.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Controller to get comprehensive channel stats for the logged-in user
const getChannelStats = asyncHandler(async (req, res) => {
    // 1. Calculate the total number of videos uploaded by the user
    const totalVideos = await Video.countDocuments({owner: req.user._id});
    
    // 2. Calculate the total views across all these videos
    // First, fetch all videos owned by the user
    const videos = await Video.find({owner: req.user._id});
    // Use reduce to sum the views of each video
    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);

    // 3. Calculate total subscribers for this user's channel
    const totalSubscribers = await Subscription.countDocuments({channel: req.user._id});

    // 4. Calculate total likes on all videos of this channel
    // Map over the fetched videos to get an array of their IDs
    const videoIds = videos.map(vid => vid._id);
    // Count all likes where the video ID is in our array of video IDs
    const totalLikes = await Like.countDocuments({video: {$in: videoIds}});

    // Construct the stats object
    const stats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    };

    // Return the stats object
    return res.status(200).json(new Apiresponse(200, stats, "Channel stats fetched successfully"));
});

// Controller to get a list of all videos uploaded by the logged-in user (for their dashboard view)
const getChannelVideos = asyncHandler(async (req, res) => {
    // Find all videos where owner is the current user and sort them by newest first
    const videos = await Video.find({owner: req.user._id}).sort({createdAt: -1});

    // Return the array of videos
    return res.status(200).json(new Apiresponse(200, videos, "Channel videos fetched successfully"));
});

export {
    getChannelStats, 
    getChannelVideos
}
