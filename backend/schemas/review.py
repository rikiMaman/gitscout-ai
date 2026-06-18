from pydantic import BaseModel, Field


class RepositoryAssessment(BaseModel):
    repo_name: str
    level: str = Field(..., examples=["Basic", "Intermediate", "Advanced"])
    assessment: str


class ReviewResponse(BaseModel):
    status: str = "success"
    username: str
    repositories: list[RepositoryAssessment]
