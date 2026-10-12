def simulate(processes):
    jobs = {
        p["processId"]: {
            "p": p,
            "remaining": p["burstTime"]
        } for p in processes
    }
    time = 0
    completed = 0
    segments = []
    completion = {}
    ids = list(jobs)

    while completed < len(processes):
        available = [
            j for j in jobs.values()
            if j["p"]["arrivalTime"] <= time and j["remaining"] > 0
        ]

        if not available:
            next_arrival = min(
                j["p"]["arrivalTime"] for j in jobs.values()
                if j["remaining"] > 0 and j["p"]["arrivalTime"] > time
            )
            segments.append({"processId": "IDLE", "start": time, "end": next_arrival})
            time = next_arrival
            continue

        current = min(
            available,
            key=lambda j: (j["remaining"], j["p"]["arrivalTime"], j["p"]["processId"])
        )
        pid = current["p"]["processId"]

        if segments and segments[-1]["processId"] == pid and segments[-1]["end"] == time:
            segments[-1]["end"] += 1
        else:
            segments.append({"processId": pid, "start": time, "end": time + 1})

        current["remaining"] -= 1
        time += 1

        if current["remaining"] == 0:
            completion[pid] = time
            completed += 1

    # Merge adjacent identical segments.
    merged = []
    for s in segments:
        if merged and merged[-1]["processId"] == s["processId"] and merged[-1]["end"] == s["start"]:
            merged[-1]["end"] = s["end"]
        else:
            merged.append(dict(s))

    return merged, completion
