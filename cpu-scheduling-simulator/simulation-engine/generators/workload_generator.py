import random

def generate_workload(count: int, seed: int | None = None):
    rng = random.Random(seed)
    processes = []
    arrival = 0

    for i in range(1, count + 1):
        # Nondecreasing random arrival times keep the workload reproducible
        # while still allowing idle periods in some generated workloads.
        arrival += rng.randint(0, 2)
        processes.append({
            "processId": f"P{i}",
            "arrivalTime": arrival,
            "burstTime": rng.randint(1, 12),
            "priority": rng.randint(1, 10),
            "timeQuantum": rng.randint(1, 5),
        })
    return processes
