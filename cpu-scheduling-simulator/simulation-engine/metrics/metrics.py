def calculate_metrics(processes, segments, completion):
    first_start = {}
    for s in segments:
        first_start.setdefault(s["processId"], s["start"])

    rows = []
    for p in processes:
        pid = p["processId"]
        ct = completion[pid]
        tat = ct - p["arrivalTime"]
        wt = tat - p["burstTime"]
        rt = first_start[pid] - p["arrivalTime"]
        rows.append({
            "processId": pid,
            "arrivalTime": p["arrivalTime"],
            "burstTime": p["burstTime"],
            "priority": p["priority"],
            "timeQuantum": p["timeQuantum"],
            "completionTime": ct,
            "turnaroundTime": tat,
            "waitingTime": wt,
            "responseTime": rt,
        })

    end = max((s["end"] for s in segments), default=0)
    busy = sum(s["end"] - s["start"] for s in segments if s["processId"] != "IDLE")
    utilisation = (busy / end * 100) if end else 0
    throughput = (len(processes) / end) if end else 0

    def avg(key):
        return sum(r[key] for r in rows) / len(rows) if rows else 0

    return {
        "processMetrics": rows,
        "averageWaitingTime": avg("waitingTime"),
        "averageTurnaroundTime": avg("turnaroundTime"),
        "averageResponseTime": avg("responseTime"),
        "cpuUtilisation": utilisation,
        "throughput": throughput,
        "simulationTime": end,
    }
