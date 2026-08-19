import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
} from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserPlaylists).post(createPlaylist);
router.route("/:playlistId").get(getPlaylistById).delete(deletePlaylist);
router
  .route("/:playlistId/video/:videoId")
  .patch(addVideoToPlaylist)
  .delete(removeVideoFromPlaylist);

export default router;
