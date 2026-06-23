import express from "express"

import { loginController, logoutController, myProfileController, refreshAccessToken, refreshCsrf, signupController, verifyOtpController, verifyUserController } from "../controllers/user.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js"
import { csrfMiddleware } from "../middlewares/csrf.middleware.js"

const userRouter = express.Router()

userRouter.post('/signup', signupController)
userRouter.post('/verify/:token', verifyUserController)
userRouter.post('/login', loginController)
userRouter.post('/verify', verifyOtpController)

userRouter.get('/profile', authMiddleware, myProfileController)

userRouter.post('/refresh', refreshAccessToken)
userRouter.post('/logout', authMiddleware, csrfMiddleware ,logoutController)
userRouter.post('/refresh-csrf', authMiddleware ,refreshCsrf)

export default userRouter