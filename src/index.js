import express from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ordersRouter from "../routes/orders.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, "..", "data");

const users = JSON.parse(readFileSync(join(dataDir, "users.json"), "utf8"));
const products = JSON.parse(readFileSync(join(dataDir, "products.json"), "utf8"));

const app = express();
app.use(express.json());

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/users", (req, res) => {
  const { role } = req.query;
  const result = role ? users.filter((u) => u.role === role) : users;
  res.json(result);
});

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return sendError(res, 404, "NOT_FOUND", `User with id ${req.params.id} not found`);
  }
  res.json(user);
});

app.post("/users", (req, res) => {
  const { name, email, role } = req.body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return sendError(res, 400, "VALIDATION_ERROR", "name is required");
  }
  if (!email || typeof email !== "string" || !email.trim()) {
    return sendError(res, 400, "VALIDATION_ERROR", "email is required");
  }

  const nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const user = {
    id: nextId,
    name: name.trim(),
    email: email.trim(),
    role: role && typeof role === "string" ? role.trim() : "user",
  };
  users.push(user);
  res.status(201).json(user);
});

app.get("/products", (req, res) => {
  let result = products;

  if (req.query.category) {
    result = result.filter((p) => p.category === req.query.category);
  }
  if (req.query.inStock === "true") {
    result = result.filter((p) => p.inStock === true);
  }

  res.json(result);
});

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return sendError(res, 404, "NOT_FOUND", `Product with id ${req.params.id} not found`);
  }
  res.json(product);
});

app.use("/orders", ordersRouter);

app.use((_req, res) => {
  sendError(res, 404, "NOT_FOUND", "Route not found");
});

export default app;

const isDirectRun = process.argv[1] && __filename === process.argv[1];
if (isDirectRun) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}
