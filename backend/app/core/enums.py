from enum import Enum


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Complexity(str, Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    HARD = "hard"


class Status(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class DeadlineType(str, Enum):
    SUPPLY = "supply"
    HR = "hr"
    GENERAL = "general"


class CandidateSource(str, Enum):
    HH = "hh"
    LINKEDIN = "linkedin"
    MANUAL = "manual"
