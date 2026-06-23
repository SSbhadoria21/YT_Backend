import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Apply verifyJWT to ensure all playlist actions are authenticated
router.use(verifyJWT);

// Route to create a new playlist
router.route("/").post(createPlaylist);

// Routes specific to a playlistId (get, update, delete)
router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

// Routes for adding and removing a video from a specific playlist
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

// Route to get all playlists for a particular user
router.route("/user/:userId").get(getUserPlaylists);

export default router;
