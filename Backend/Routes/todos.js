const express = require("express");
const router = express.Router();
const Todo = require("../Models/Todo");
const jwt = require("jsonwebtoken");

// Middleware to verify token
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
}

// GET todos for logged-in user
router.get("/", auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.userId });
  res.json(todos);
});

// CREATE todo
router.post("/", auth, async (req, res) => {
  const todo = await Todo.create({
    userId: req.userId,
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate
  });
  res.json(todo);
});

// UPDATE todo
router.put("/:id", auth, async (req, res) => {
  const updated = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE todo
router.delete("/:id", auth, async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ msg: "Todo deleted" });
});

module.exports = router;
