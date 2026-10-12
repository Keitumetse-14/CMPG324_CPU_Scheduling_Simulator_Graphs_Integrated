# CMPG324 CPU Scheduling Simulator

A CPU scheduling simulator based on the supplied CMPG324 blueprint. It implements:

- FCFS (non-preemptive)
- SRTF (preemptive)
- Round Robin (preemptive)
- Workloads of 10, 20, 30, 40 and 50 processes
- Waiting, turnaround, response time
- CPU utilisation and throughput
- Interactive metric cards and per-process results tables
- Five performance graphs comparing FCFS, SRTF and Round Robin across 10, 20, 30, 40 and 50 processes
- Algorithm comparison using reproducible workloads
- Experiment results displayed in graphs and a detailed table

## Architecture

Next.js + TypeScript frontend → Node.js + TypeScript API → Python/FastAPI simulation engine.

## Requirements

- Node.js 18+
- Python 3.10+

## Run

### 1. Python simulation engine

```bash
cd simulation-engine
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

### 2. Node API

Open another terminal:

```bash
cd backend
npm install
npm run dev
```

The Node API runs on http://localhost:4000.

### 3. Next.js frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

The frontend calls the Node API, which forwards simulations to FastAPI.

## Project structure

```text
cpu-scheduling-simulator/
├── frontend/
├── backend/
├── simulation-engine/
│   ├── algorithms/
│   ├── api/
│   ├── generators/
│   ├── metrics/
│   ├── models/
│   └── experiments/
├── tests/
└── README.md
```
