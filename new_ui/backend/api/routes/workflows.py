"""
Workflows API Routes
Handles paper-to-code and chat-based planning workflows
"""

import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException

from services.workflow_service import workflow_service
from models.requests import PaperToCodeRequest, ChatPlanningRequest
from models.responses import TaskResponse, WorkflowStatusResponse


router = APIRouter()


@router.post("/paper-to-code", response_model=TaskResponse)
async def start_paper_to_code(
    request: PaperToCodeRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start a paper-to-code workflow.
    Returns a task ID that can be used to track progress via WebSocket.
    """
    task = workflow_service.create_task()

    # Run workflow in background
    background_tasks.add_task(
        workflow_service.execute_paper_to_code,
        task.task_id,
        request.input_source,
        request.input_type,
        request.enable_indexing,
    )

    return TaskResponse(
        task_id=task.task_id,
        status="started",
        message="Paper-to-code workflow started",
    )


@router.post("/chat-planning", response_model=TaskResponse)
async def start_chat_planning(
    request: ChatPlanningRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start a chat-based planning workflow.
    Returns a task ID that can be used to track progress via WebSocket.
    """
    task = workflow_service.create_task()

    # Run workflow in background
    background_tasks.add_task(
        workflow_service.execute_chat_planning,
        task.task_id,
        request.requirements,
        request.enable_indexing,
    )

    return TaskResponse(
        task_id=task.task_id,
        status="started",
        message="Chat planning workflow started",
    )


@router.get("/status/{task_id}", response_model=WorkflowStatusResponse)
async def get_workflow_status(task_id: str):
    """Get the status of a workflow task"""
    task = workflow_service.get_task(task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return WorkflowStatusResponse(
        task_id=task.task_id,
        status=task.status,
        progress=task.progress,
        message=task.message,
        result=task.result,
        error=task.error,
        started_at=task.started_at,
        completed_at=task.completed_at,
    )


@router.post("/cancel/{task_id}")
async def cancel_workflow(task_id: str):
    """Cancel a running workflow"""
    success = workflow_service.cancel_task(task_id)

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Task not found or cannot be cancelled",
        )

    return {"status": "cancelled", "task_id": task_id}
