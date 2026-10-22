import { Router } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const orders = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "orders.json"), "utf8"),
);

const router = Router();

router.get("/", (req, res) => {
  let result = orders;

  if (req.query.status !== undefined) {
    result = result.filter((order) => order.status === req.query.status);
  }

  if (req.query.userId !== undefined) {
    const userId = Number(req.query.userId);
    result = result.filter((order) => order.userId === userId);
  }

  res.json(result);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find((item) => item.id === id);
  if (!order) {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: `Order with id ${req.params.id} not found`,
      },
    });
  }
  res.json(order);
});

export default router;
