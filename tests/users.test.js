import request from "supertest";
import { describe, expect, it } from "@jest/globals";
import app from "../src/index.js";

const seedUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user" },
  { id: 3, name: "Carol Williams", email: "carol@example.com", role: "user" },
  { id: 4, name: "David Brown", email: "david@example.com", role: "moderator" },
  { id: 5, name: "Eva Martinez", email: "eva@example.com", role: "user" },
  { id: 6, name: "Frank Lee", email: "frank@example.com", role: "user" },
  { id: 7, name: "Grace Kim", email: "grace@example.com", role: "admin" },
  { id: 8, name: "Henry Davis", email: "henry@example.com", role: "user" },
  { id: 9, name: "Iris Patel", email: "iris@example.com", role: "moderator" },
  { id: 10, name: "Jack Wilson", email: "jack@example.com", role: "user" },
];

describe("GET /users", () => {
  it("returns 200 and the user list", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(seedUsers);
  });

  it("returns only users with the requested role", async () => {
    const response = await request(app).get("/users").query({ role: "admin" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin" },
      { id: 7, name: "Grace Kim", email: "grace@example.com", role: "admin" },
    ]);
  });
});

describe("GET /users/:id", () => {
  it("returns 200 and the matching user", async () => {
    const response = await request(app).get("/users/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "admin",
    });
  });

  it("returns 404 with an error body when the id is missing", async () => {
    const response = await request(app).get("/users/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "User with id 999 not found",
      },
    });
  });
});

describe("POST /users", () => {
  it("returns 201 and the created user when name and email are valid", async () => {
    const response = await request(app).post("/users").send({
      name: "  Ada Lovelace  ",
      email: "  ada@example.com  ",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 11,
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: "user",
    });

    const stored = await request(app).get("/users/11");
    expect(stored.status).toBe(200);
    expect(stored.body).toEqual(response.body);
  });

  it.each([
    [{ email: "ada@example.com" }, "name is required"],
    [{ name: "Ada Lovelace" }, "email is required"],
    [{ name: "", email: "ada@example.com" }, "name is required"],
    [{ name: "Ada Lovelace", email: "" }, "email is required"],
    [{ name: "   ", email: "ada@example.com" }, "name is required"],
    [{ name: "Ada Lovelace", email: "   " }, "email is required"],
  ])("returns 400 when the body is %j", async (body, message) => {
    const response = await request(app).post("/users").send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message,
      },
    });
  });
});
