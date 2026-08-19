import { Router } from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  getVideoLikes,
  getCommentLikes,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/video/:videoId").get(getVideoLikes).post(toggleVideoLike);
router.route("/comment/:commentId").get(getCommentLikes).post(toggleCommentLike);

export default router;
