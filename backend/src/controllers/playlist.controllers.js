import mongoose from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Playlist name is required");
  }

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user._id,
    videos: [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const playlists = await Playlist.find({ owner: userId })
    .populate("videos", "title thumbnail duration owner")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Valid playlist id is required");
  }

  const playlist = await Playlist.findById(playlistId).populate(
    "videos",
    "title thumbnail duration owner"
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Valid playlist id is required");
  }

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!playlist.videos.includes(videoId)) {
    playlist.videos.push(videoId);
    await playlist.save({ validateBeforeSave: false });
  }

  const updatedPlaylist = await Playlist.findById(playlistId).populate(
    "videos",
    "title thumbnail duration owner"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Valid playlist id is required");
  }

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Valid video id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this playlist");
  }

  const videoExists = playlist.videos.some(
    (item) => item.toString() === videoId.toString()
  );

  if (!videoExists) {
    throw new ApiError(404, "Video not found in playlist");
  }

  playlist.videos = playlist.videos.filter(
    (item) => item.toString() !== videoId.toString()
  );
  await playlist.save({ validateBeforeSave: false });

  const updatedPlaylist = await Playlist.findById(playlistId).populate(
    "videos",
    "title thumbnail duration owner"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Valid playlist id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this playlist");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
};
