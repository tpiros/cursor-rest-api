import express from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

const users = JSON.parse(readFileSync(join(dataDir, "users.json"), "utf8"));
const products = JSON.parse(readFileSync(join(dataDir, "products.json"), "utf8"));

const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
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
    return sendError(
      res,
      404,
      "NOT_FOUND",
      `No user with id ${req.params.id}. List users with GET /users and retry with an id from that list.`,
    );
  }
  res.json(user);
});

app.post("/users", (req, res) => {
  const { name, email, role } = req.body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      'Missing or empty "name". Include a non-empty string "name" in the JSON body.',
    );
  }
  if (!email || typeof email !== "string" || !email.trim()) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      'Missing or empty "email". Include a non-empty string "email" in the JSON body.',
    );
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
    return sendError(
      res,
      404,
      "NOT_FOUND",
      `No product with id ${req.params.id}. List products with GET /products and retry with an id from that list.`,
    );
  }
  res.json(product);
});

app.use((_req, res) => {
  sendError(
    res,
    404,
    "NOT_FOUND",
    "No route matches this request. Check the path and HTTP method, or try GET /health.",
  );
});

export default app;

const isDirectRun =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}
