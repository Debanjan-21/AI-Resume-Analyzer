from fastapi import Depends
from typing import List
from fastapi import Query

from app.schemas.resume_schema import (
    ResumeResponse,
    ResumeDetailResponse,
)

from app.dependencies.auth import get_current_user

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
)

from app.services.resume_service import ResumeService
from app.schemas.ai_schema import AIResumeResponse

from app.schemas.job_match_schema import (
    JobMatchRequest,
    JobMatchResponse,
)

router = APIRouter(
    prefix="/api/resumes",
    tags=["Resume"],
)


@router.post(
    "/upload",
    response_model=ResumeResponse,
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    try:
        return await ResumeService.upload_resume(
            file=file,
            current_user=current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
    
@router.get(
    "/",
    response_model=List[ResumeResponse],
)
async def get_resumes(
    current_user=Depends(get_current_user),
):
    return await ResumeService.get_user_resumes(
        str(current_user["_id"])
    )

@router.get(
    "/{resume_id}",
    response_model=ResumeDetailResponse,
)
async def get_resume(
    resume_id: str,
    current_user=Depends(get_current_user),
):
    try:
        return await ResumeService.get_resume(
            resume_id,
            current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

@router.post(
    "/{resume_id}/match",
    response_model=JobMatchResponse,
)
async def match_resume(
    resume_id: str,
    request: JobMatchRequest,
    current_user=Depends(get_current_user),
):
    try:
        return await ResumeService.match_resume(
            resume_id=resume_id,
            job_description=request.job_description,
            current_user=current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

@router.get(
    "/{resume_id}/improve",
    response_model=AIResumeResponse,
)
async def get_ai_resume_improvements(
    resume_id: str,
    current_user=Depends(get_current_user),
):
    try:
        return await ResumeService.improve_resume(
            resume_id,
            current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

@router.post("/{resume_id}/improve")
async def improve_resume(
    resume_id: str,
    force_refresh: bool = Query(False),
    current_user=Depends(get_current_user),
):
    return await ResumeService.improve_resume(
        resume_id,
        current_user,
        force_refresh,
    )

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user=Depends(get_current_user),
):
    try:
        return await ResumeService.delete_resume(
            resume_id,
            current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )