from generators.workload_generator import generate_workload
from algorithms.fcfs import simulate as fcfs
from algorithms.srtf import simulate as srtf
from algorithms.round_robin import simulate as rr
from metrics.metrics import calculate_metrics

ALGORITHMS = {
    "FCFS": fcfs,
    "SRTF": srtf,
    "Round Robin": rr,
}

def run_experiments(seed=324):
    results = []
    for count in [10, 20, 30, 40, 50]:
        workload = generate_workload(count, seed + count)
        for name, fn in ALGORITHMS.items():
            segments, completion = fn(workload)
            metrics = calculate_metrics(workload, segments, completion)
            results.append({
                "processCount": count,
                "runId": f"run-{seed + count}",
                "algorithm": name,
                "averageWaitingTime": metrics["averageWaitingTime"],
                "averageTurnaroundTime": metrics["averageTurnaroundTime"],
                "averageResponseTime": metrics["averageResponseTime"],
                "cpuUtilisation": metrics["cpuUtilisation"],
                "throughput": metrics["throughput"],
                "contextSwitches": max(0, len([s for s in segments if s["processId"] != "IDLE"]) - 1),
            })
    return results
