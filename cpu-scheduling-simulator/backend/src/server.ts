import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PYTHON_URL = process.env.PYTHON_URL || "http://127.0.0.1:8000";

async function forward(path: string, options: RequestInit = {}) {
  const response = await fetch(`${PYTHON_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json();
  return { status: response.status, data };
}

app.get("/api/health", async (_req, res) => {
  try {
    const result = await forward("/health");
    res.status(result.status).json(result.data);
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

app.post("/api/workloads", async (req, res) => {
  const result = await forward("/workloads", {
    method: "POST", body: JSON.stringify(req.body)
  });
  res.status(result.status).json(result.data);
});

app.post("/api/simulate/:algorithm", async (req, res) => {
  const result = await forward(`/simulate/${req.params.algorithm}`, {
    method: "POST", body: JSON.stringify(req.body)
  });
  res.status(result.status).json(result.data);
});

app.post("/api/simulate/compare", async (req, res) => {
  const result = await forward("/simulate/compare", {
    method: "POST", body: JSON.stringify(req.body)
  });
  res.status(result.status).json(result.data);
});

app.post("/api/experiments", async (req, res) => {
  const seed = Number(req.body?.seed ?? 324);
  const result = await forward(`/experiments/run?seed=${seed}`, { method: "POST" });
  res.status(result.status).json(result.data);
});

app.listen(4000, () => console.log("Node API listening on http://localhost:4000"));
