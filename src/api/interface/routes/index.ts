import { Router } from "express";
import statusRouter from "./status";
import uploadRouter from "./upload";

const router = Router();

router.use("/api", statusRouter);
router.use("/api", uploadRouter);

router.get("/health", (_, res) => {
  res.status(200).send("OK");
});

export default router;