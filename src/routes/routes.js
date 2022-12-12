import { Router } from "express";
import UserRouter from "./UserRouter.js";

const router = Router();

router.use(UserRouter);

export default router;