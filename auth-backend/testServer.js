import express from "express";

const app = express();

app.use(express.json());

app.post("/ping", (req, res) => {
  console.log("Request received:", req.body);
  res.json({ status: "ok", received: req.body });
});

app.listen(5000, () => console.log("Test server running on port 5000"));
