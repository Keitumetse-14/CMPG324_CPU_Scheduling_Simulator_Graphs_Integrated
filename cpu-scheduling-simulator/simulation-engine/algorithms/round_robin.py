from collections import deque

def simulate(processes):
    jobs = {
        p["processId"]: {
            "p": p,
            "remaining": p["burstTime"]
        } for p in processes
    }
    ordered = sorted(processes, key=lambda p: (p["arrivalTime"], p["processId"]))
    q = deque()
    i = 0
    time = 0
    completion = {}
    segments = []

    while len(completion) < len(processes):
        while i < len(ordered) and ordered[i]["arrivalTime"] <= time:
            q.append(ordered[i]["processId"])
            i += 1

        if not q:
            if i < len(ordered):
                nxt = ordered[i]["arrivalTime"]
                segments.append({"processId": "IDLE", "start": time, "end": nxt})
                time = nxt
                continue
            break

        pid = q.popleft()
        job = jobs[pid]
        quantum = job["p"]["timeQuantum"]
        run = min(quantum, job["remaining"])

        start = time
        time += run
        job["remaining"] -= run
        segments.append({"processId": pid, "start": start, "end": time})

        while i < len(ordered) and ordered[i]["arrivalTime"] <= time:
            q.append(ordered[i]["processId"])
            i += 1

        if job["remaining"] > 0:
            q.append(pid)
        else:
            completion[pid] = time

    return segments, completion
