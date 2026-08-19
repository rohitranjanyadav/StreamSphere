import { Router } from "express";
import {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/channel/:channelId").get(getChannelSubscribers).post(toggleSubscription);
router.route("/subscriber/:subscriberId").get(getSubscribedChannels);

export default router;
