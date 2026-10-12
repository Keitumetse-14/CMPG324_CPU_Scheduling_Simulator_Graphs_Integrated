"use client";

import { useState } from "react";

type Process = {
  processId: string; arrivalTime: number; burstTime: number; priority: number; timeQuantum: number;
};
type Segment = { processId: string; start: number; end: number };
type Result = {
  algorithm: string; segments: Segment[]; processMetrics: any[];
  averageWaitingTime: number; averageTurnaroundTime: number; averageResponseTime: number;
  cpuUtilisation: number; throughput: number; simulationTime: number;
};
type Experiment = {
  processCount: number; algorithm: string; averageWaitingTime: number;
  averageTurnaroundTime: number; averageResponseTime: number; cpuUtilisation: number; throughput: number;
};

type MetricKey = "averageWaitingTime" | "averageTurnaroundTime" | "averageResponseTime" | "cpuUtilisation" | "throughput";

type ChartProps = { title: string; metric: MetricKey; results: Experiment[]; suffix?: string };

function PerformanceChart({ title, metric, results, suffix = "" }: ChartProps) {
  const width = 560;
  const height = 280;
  const left = 58;
  const right = 22;
  const top = 22;
  const bottom = 48;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const counts = [10, 20, 30, 40, 50];
  const algorithms = [
    { name: "FCFS", color: "#2563eb" },
    { name: "SRTF", color: "#ea580c" },
    { name: "Round Robin", color: "#16a34a" },
  ];
  const values = results.map((row) => Number(row[metric])).filter(Number.isFinite);
  const maxValue = Math.max(1, ...values) * 1.08;
  const x = (count: number) => left + ((count - 10) / 40) * plotWidth;
  const y = (value: number) => top + plotHeight - (value / maxValue) * plotHeight;
  const tickValues = Array.from({ length: 5 }, (_, i) => (maxValue * i) / 4);
  const format = (value: number) => value.toFixed(metric === "throughput" ? 3 : 1);

  return (
    <div className="performance-chart">
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title} by number of processes`}>
        {tickValues.map((tick, index) => (
          <g key={index}>
            <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="chart-gridline" />
            <text x={left - 9} y={y(tick) + 4} textAnchor="end" className="chart-axis-label">{format(tick)}</text>
          </g>
        ))}
        <line x1={left} x2={left} y1={top} y2={top + plotHeight} className="chart-axis" />
        <line x1={left} x2={width - right} y1={top + plotHeight} y2={top + plotHeight} className="chart-axis" />
        {counts.map((count) => (
          <g key={count}>
            <line x1={x(count)} x2={x(count)} y1={top + plotHeight} y2={top + plotHeight + 5} className="chart-axis" />
            <text x={x(count)} y={top + plotHeight + 22} textAnchor="middle" className="chart-axis-label">{count}</text>
          </g>
        ))}
        {algorithms.map((algorithm) => {
          const points = counts.map((count) => {
            const row = results.find((item) => item.processCount === count && item.algorithm === algorithm.name);
            return row ? { x: x(count), y: y(Number(row[metric])) } : null;
          }).filter((point): point is { x: number; y: number } => point !== null);
          return (
            <g key={algorithm.name}>
              <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke={algorithm.color} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
              {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="4" fill={algorithm.color} stroke="white" strokeWidth="1.5" />)}
            </g>
          );
        })}
        <text x={left + plotWidth / 2} y={height - 8} textAnchor="middle" className="chart-axis-title">Number of processes</text>
      </svg>
      <div className="chart-legend">
        {algorithms.map((algorithm) => <span key={algorithm.name}><i style={{ background: algorithm.color }} />{algorithm.name}</span>)}
      </div>
      {suffix && <p className="chart-unit">Unit: {suffix}</p>}
    </div>
  );
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function Home() {
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(324);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selected, setSelected] = useState("Compare All");
  const [results, setResults] = useState<Record<string, Result>>({});
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [error, setError] = useState("");

  async function generate() {
    try {
      setError("");
      const r = await fetch(`${API}/workloads`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({count, seed})
      });
      if (!r.ok) throw new Error("Could not generate workload.");
      const data = await r.json();
      setProcesses(data.processes);
      setResults({});
    } catch(e:any) { setError(e.message); }
  }

  async function simulate() {
    if (!processes.length) { setError("Generate a workload first."); return; }
    try {
      setError("");
      const path = selected === "Compare All" ? "simulate/compare" :
        `simulate/${selected === "Round Robin" ? "round-robin" : selected.toLowerCase()}`;
      const r = await fetch(`${API}/${path}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({processes})
      });
      if (!r.ok) throw new Error("Simulation failed.");
      const data = await r.json();
      setResults(selected === "Compare All" ? data : {[selected]:data});
    } catch(e:any) { setError(e.message); }
  }

  async function runExperiments() {
    try {
      setError("");
      const r = await fetch(`${API}/experiments`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({seed})
      });
      if (!r.ok) throw new Error("Experiment failed.");
      setExperiments((await r.json()).results);
    } catch(e:any) { setError(e.message); }
  }


  return (
    <main className="container">
      <div className="header">
        <div>
          <h1>CMPG324 CPU Scheduling Simulator</h1>
          <div className="muted">FCFS · SRTF · Round Robin</div>
        </div>
        <button className="secondary" onClick={() => {setProcesses([]);setResults({});setExperiments([]);setError("")}}>Reset</button>
      </div>

      {error && <div className="error">{error}</div>}

      <section className="controls">
        <label className="field">Process count
          <select value={count} onChange={e=>setCount(Number(e.target.value))}>
            {[10,20,30,40,50].map(n=><option key={n}>{n}</option>)}
          </select>
        </label>
        <label className="field">Seed
          <input type="number" value={seed} onChange={e=>setSeed(Number(e.target.value))}/>
        </label>
        <button onClick={generate}>Generate workload</button>
        <label className="field">Algorithm
          <select value={selected} onChange={e=>setSelected(e.target.value)}>
            <option>Compare All</option><option>FCFS</option><option>SRTF</option><option>Round Robin</option>
          </select>
        </label>
        <button onClick={simulate}>Run simulation</button>
        <button className="secondary" onClick={runExperiments}>Run 10–50 experiment</button>
      </section>

      {processes.length > 0 && (
        <section className="card">
          <h2>Generated workload ({processes.length} processes)</h2>
          <div style={{overflowX:"auto"}}>
            <table><thead><tr><th>ID</th><th>Arrival</th><th>Burst</th><th>Priority</th><th>Quantum</th></tr></thead>
              <tbody>{processes.map(p=><tr key={p.processId}><td>{p.processId}</td><td>{p.arrivalTime}</td><td>{p.burstTime}</td><td>{p.priority}</td><td>{p.timeQuantum}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

      {experiments.length > 0 && (
        <section className="card">
          <h2>Algorithm performance graphs</h2>
          <p className="muted chart-intro">Compare how each algorithm performs as the workload increases from 10 to 50 processes. All three algorithms use the generated workload for each process count.</p>
          <div className="performance-charts">
            <PerformanceChart title="Average waiting time" metric="averageWaitingTime" results={experiments} suffix="time units" />
            <PerformanceChart title="Average turnaround time" metric="averageTurnaroundTime" results={experiments} suffix="time units" />
            <PerformanceChart title="Average response time" metric="averageResponseTime" results={experiments} suffix="time units" />
            <PerformanceChart title="CPU utilisation" metric="cpuUtilisation" results={experiments} suffix="percent (%)" />
            <PerformanceChart title="Throughput" metric="throughput" results={experiments} suffix="processes per time unit" />
          </div>
        </section>
      )}

      {Object.values(results).length > 0 && (
        <section className="grid">
          {Object.values(results).map(r=><div className="card" key={r.algorithm}>
            <h2>{r.algorithm} metrics</h2>
            <div className="metrics">
              <div className="metric">Avg waiting<strong>{r.averageWaitingTime.toFixed(2)}</strong></div>
              <div className="metric">Avg turnaround<strong>{r.averageTurnaroundTime.toFixed(2)}</strong></div>
              <div className="metric">Avg response<strong>{r.averageResponseTime.toFixed(2)}</strong></div>
              <div className="metric">CPU utilisation<strong>{r.cpuUtilisation.toFixed(2)}%</strong></div>
              <div className="metric">Throughput<strong>{r.throughput.toFixed(4)}</strong></div>
            </div>
            <div style={{overflowX:"auto",marginTop:15}}>
              <table><thead><tr><th>PID</th><th>Completion</th><th>Waiting</th><th>Turnaround</th><th>Response</th></tr></thead>
              <tbody>{r.processMetrics.map((p:any)=><tr key={p.processId}><td>{p.processId}</td><td>{p.completionTime}</td><td>{p.waitingTime}</td><td>{p.turnaroundTime}</td><td>{p.responseTime}</td></tr>)}</tbody></table>
            </div>
          </div>)}
        </section>
      )}

      {experiments.length > 0 && (
        <section className="card">
          <h2>10–50 process experiment results</h2>
          <div style={{overflowX:"auto"}}>
            <table><thead><tr><th>Processes</th><th>Algorithm</th><th>Avg waiting</th><th>Avg turnaround</th><th>Avg response</th><th>CPU %</th><th>Throughput</th></tr></thead>
              <tbody>{experiments.map((e,i)=><tr key={i}><td>{e.processCount}</td><td>{e.algorithm}</td><td>{e.averageWaitingTime.toFixed(2)}</td><td>{e.averageTurnaroundTime.toFixed(2)}</td><td>{e.averageResponseTime.toFixed(2)}</td><td>{e.cpuUtilisation.toFixed(2)}</td><td>{e.throughput.toFixed(4)}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card">
        <h2>Simulation flow</h2>
        <p className="muted">Generate workload → compare FCFS, SRTF and Round Robin → inspect metric cards and process results → run the 10, 20, 30, 40 and 50 process experiment → compare the five performance graphs.</p>
      </section>
    </main>
  );
}
