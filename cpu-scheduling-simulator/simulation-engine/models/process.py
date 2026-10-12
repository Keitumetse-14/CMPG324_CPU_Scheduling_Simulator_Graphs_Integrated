from pydantic import BaseModel, Field

class Process(BaseModel):
    processId: str
    arrivalTime: int = Field(ge=0)
    burstTime: int = Field(gt=0)
    priority: int = Field(ge=0)
    timeQuantum: int = Field(gt=0)

class Segment(BaseModel):
    processId: str
    start: int
    end: int
