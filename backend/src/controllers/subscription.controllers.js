import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Valid channel id is required");
  }

  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribed: false },
          "Subscription removed successfully"
        )
      );
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Valid channel id is required");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "fullName username avatar"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Channel subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId || !mongoose.isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Valid subscriber id is required");
  }

  const subscriber = await User.findById(subscriberId);

  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }

  const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate(
    "channel",
    "fullName username avatar"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
