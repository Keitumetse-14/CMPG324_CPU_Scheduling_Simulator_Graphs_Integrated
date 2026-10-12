import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parents[1] / "simulation-engine"))

from algorithms.fcfs import simulate as fcfs
from algorithms.srtf import simulate as srtf
from algorithms.round_robin import simulate as rr

WORKLOAD = [
    {"processId":"P1","arrivalTime":0,"burstTime":5,"priority":1,"timeQuantum":2},
    {"processId":"P2","arrivalTime":1,"burstTime":2,"priority":2,"timeQuantum":2},
    {"processId":"P3","arrivalTime":2,"burstTime":1,"priority":3,"timeQuantum":2},
]

def test_fcfs_completes_all():
    _, c = fcfs(WORKLOAD)
    assert set(c) == {"P1","P2","P3"}

def test_srtf_completes_all():
    _, c = srtf(WORKLOAD)
    assert set(c) == {"P1","P2","P3"}

def test_rr_completes_all():
    _, c = rr(WORKLOAD)
    assert set(c) == {"P1","P2","P3"}
