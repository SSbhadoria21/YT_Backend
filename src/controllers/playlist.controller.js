import mongoose, {isValidObjectId} from "mongoose"
import {PlayList} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Controller to create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    // Extract playlist name and description from the body
    const {name, description} = req.body;

    // Validate that both fields are provided
    if(!name || !description){
        throw new apiError(400, "Name and description both are required");
    }

    // Create the playlist in the database, with an initially empty videos array
    const playlist = await PlayList.create({
        name,
        description,
        videos: [],
        owner: req.user._id // Map to the current logged-in user
    });

    // Check if the playlist was successfully created
    if(!playlist){
        throw new apiError(500, "Error in creating playlist");
    }

    // Return the response with the newly created playlist
    return res.status(200).json(new Apiresponse(200, playlist, "Playlist created successfully"));
});

// Controller to get all playlists of a specific user
const getUserPlaylists = asyncHandler(async (req, res) => {
    // Extract user ID from URL
    const {userId} = req.params;

    // Validate user ID format
    if(!isValidObjectId(userId)){
        throw new apiError(400, "Invalid user ID");
    }

    // Find all playlists belonging to this user
    const playlists = await PlayList.find({owner: userId});

    // Return the fetched playlists
    return res.status(200).json(new Apiresponse(200, playlists, "User playlists fetched successfully"));
});

// Controller to get a specific playlist by its ID along with the populated videos
const getPlaylistById = asyncHandler(async (req, res) => {
    // Extract playlist ID from URL
    const {playlistId} = req.params;

    // Validate the ID
    if(!isValidObjectId(playlistId)){
        throw new apiError(400, "Invalid playlist ID");
    }

    // Use aggregation to fetch the playlist and populate the complete video objects within it
    const playlist = await PlayList.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            // Join with the videos collection to replace object IDs with full video data
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        }
    ]);

    // Check if the playlist exists
    if(!playlist?.length){
        throw new apiError(404, "Playlist not found");
    }

    // Return the playlist object
    return res.status(200).json(new Apiresponse(200, playlist[0], "Playlist fetched successfully"));
});

// Controller to add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // Extract playlist ID and video ID from the parameters
    const {playlistId, videoId} = req.params;

    // Validate both IDs
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400, "Invalid playlist or video ID");
    }

    // Find the playlist and make sure the current user is its owner
    const playlist = await PlayList.findOne({_id: playlistId, owner: req.user._id});

    // If not found or unauthorized
    if(!playlist){
        throw new apiError(404, "Playlist not found or unauthorized");
    }

    // Check if the video already exists in the playlist to prevent duplicates
    if(playlist.videos.includes(videoId)){
        return res.status(200).json(new Apiresponse(200, playlist, "Video already exists in playlist"));
    }

    // Push the new video ID to the array and save the document
    playlist.videos.push(videoId);
    await playlist.save({validateBeforeSave: false});

    // Return the updated playlist
    return res.status(200).json(new Apiresponse(200, playlist, "Video added to playlist"));
});

// Controller to remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // Extract both IDs
    const {playlistId, videoId} = req.params;

    // Validate them
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400, "Invalid playlist or video ID");
    }

    // Check playlist ownership
    const playlist = await PlayList.findOne({_id: playlistId, owner: req.user._id});

    if(!playlist){
        throw new apiError(404, "Playlist not found or unauthorized");
    }

    // Filter out the video ID from the videos array
    playlist.videos = playlist.videos.filter(vid => vid.toString() !== videoId);
    // Save changes
    await playlist.save({validateBeforeSave: false});

    // Return updated playlist
    return res.status(200).json(new Apiresponse(200, playlist, "Video removed from playlist"));
});

// Controller to delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    // Extract playlist ID
    const {playlistId} = req.params;

    // Validate it
    if(!isValidObjectId(playlistId)){
        throw new apiError(400, "Invalid playlist ID");
    }

    // Delete the playlist if the user owns it
    const playlist = await PlayList.findOneAndDelete({_id: playlistId, owner: req.user._id});

    if(!playlist){
        throw new apiError(404, "Playlist not found or unauthorized");
    }

    // Success response
    return res.status(200).json(new Apiresponse(200, {}, "Playlist deleted successfully"));
});

// Controller to update a playlist's name and description
const updatePlaylist = asyncHandler(async (req, res) => {
    // Extract playlist ID
    const {playlistId} = req.params;
    // Extract new name/description
    const {name, description} = req.body;

    // Validate ID
    if(!isValidObjectId(playlistId)){
        throw new apiError(400, "Invalid playlist ID");
    }

    // Dynamically build the update fields object based on what the user provided
    const updateFields = {};
    if(name) updateFields.name = name;
    if(description) updateFields.description = description;

    // Update the playlist if owned by user
    const playlist = await PlayList.findOneAndUpdate(
        {_id: playlistId, owner: req.user._id},
        {$set: updateFields},
        {new: true} // Return updated document
    );

    if(!playlist){
        throw new apiError(404, "Playlist not found or unauthorized");
    }

    return res.status(200).json(new Apiresponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
