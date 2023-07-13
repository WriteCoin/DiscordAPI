import { Router } from "express";
import { router as authRouter } from "./authRouter.js";
import { router as messageRouter } from "./messageRouter.js";

export const router = new Router()

router.use('/auth/discord', authRouter)
router.use('/discord', messageRouter)