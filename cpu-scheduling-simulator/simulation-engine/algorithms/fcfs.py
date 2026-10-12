def simulate(processes):
    ps = sorted(processes, key=lambda p: (p["arrivalTime"], p["processId"]))
    time = 0
    segments = []
    completion = {}

    for p in ps:
        if time < p["arrivalTime"]:
            segments.append({"processId": "IDLE", "start": time, "end": p["arrivalTime"]})
            time = p["arrivalTime"]

        start = time
        time += p["burstTime"]
        segments.append({"processId": p["processId"], "start": start, "end": time})
        completion[p["processId"]] = time

    return segments, completion
