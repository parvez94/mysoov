import express from "express"
import { verifyToken } from "../utils/verifyToken.js"
import {
  getVideo,
  addVideo,
  updateVideo,
  deleteVideo,
  addView,
  randomVideos,
  trend,
  videoFeeds,
  search,
} from "../controllers/videoCtrl.js"

const router = express.Router()

router.post("/", verifyToken, addVideo)
router.put("/:id", verifyToken, updateVideo)
router.delete("/:id", verifyToken, deleteVideo)

router.get("/find/:id", getVideo)
router.get("/random", randomVideos)
router.get("/feeds", verifyToken, videoFeeds)

// router.get("/search", search)
// router.put("/view/:id", addView)
// router.get("/trend", trend)

export default router
