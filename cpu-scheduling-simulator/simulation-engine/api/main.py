from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from algorithms.fcfs import simulate as fcfs
from algorithms.srtf import simulate as srtf
from algorithms.round_robin import simulate as rr
from metrics.metrics import calculate_metrics
from generators.workload_generator import generate_workload
from experiments.experiment_runner import run_experiments

app = FastAPI(title="CMPG324 CPU Scheduling Simulation Engine")

class WorkloadRequest(BaseModel):
    processes: list[dict]

class GenerateRequest(BaseModel):
    count: int = Field(ge=1, le=50)
    seed: int | None = 324

def run(processes, algorithm):
    if not processes:
        raise HTTPException(400, "At least one process is required.")
    funcs = {"FCFS": fcfs, "SRTF": srtf, "Round Robin": rr}
    if algorithm not in funcs:
        raise HTTPException(400, "Unknown algorithm.")
    segments, completion = funcs[algorithm](processes)
    return {
        "algorithm": algorithm,
        "segments": segments,
        **calculate_metrics(processes, segments, completion)
    }

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/workloads")
def workload(req: GenerateRequest):
    return {"processes": generate_workload(req.count, req.seed)}

@app.post("/simulate/{algorithm}")
def simulate(algorithm: str, req: WorkloadRequest):
    mapping = {"fcfs": "FCFS", "srtf": "SRTF", "round-robin": "Round Robin"}
    key = mapping.get(algorithm.lower())
    if not key:
        raise HTTPException(404, "Algorithm not found.")
    return run(req.processes, key)

@app.post("/simulate/compare")
def compare(req: WorkloadRequest):
    return {name: run(req.processes, name) for name in ["FCFS", "SRTF", "Round Robin"]}

@app.post("/experiments/run")
def experiments(seed: int = 324):
    return {"results": run_experiments(seed)}
