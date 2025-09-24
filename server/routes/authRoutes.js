import express from "express"
import { register, login } from "../controllers/authCtrl.js"

const router = express.Router()

// Signup
router.post("/signup", register)

// Signin
router.post("/signin", login)

export default router
