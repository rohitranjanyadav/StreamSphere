import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    const likeCount = await Like.countDocuments({ video: videoId });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, likeCount },
          "Video like removed successfully"
        )
      );
  }

  await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  const likeCount = await Like.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, likeCount },
        "Video liked successfully"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Valid comment id is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    const likeCount = await Like.countDocuments({ comment: commentId });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, likeCount },
          "Comment like removed successfully"
        )
      );
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  const likeCount = await Like.countDocuments({ comment: commentId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, likeCount },
        "Comment liked successfully"
      )
    );
});

const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const likes = await Like.find({ video: videoId }).populate(
    "likedBy",
    "fullName username avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, likes, "Video likes fetched successfully"));
});

const getCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Valid comment id is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const likes = await Like.find({ comment: commentId }).populate(
    "likedBy",
    "fullName username avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, likes, "Comment likes fetched successfully"));
});

export {
  toggleVideoLike,
  toggleCommentLike,
  getVideoLikes,
  getCommentLikes,
};
