from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.exception_service import ExceptionService
from app.models.exception import ReportExceptionRequest, ResolveExceptionRequest

router = APIRouter()
exception_service = ExceptionService()


@router.post("/", status_code=201)
async def report_exception(body: ReportExceptionRequest):
    """Report a new delivery exception."""
    result = await exception_service.report_delivery_exception(
        shipment_id=body.shipment_id,
        exception_type=body.exception_type,
        description=body.description,
        severity=body.severity,
        reported_by=body.reported_by,
    )
    return result


@router.get("/")
async def list_exceptions(
    status: Optional[str] = Query(None, description="Filter by status"),
    shipment_id: Optional[str] = Query(None, description="Filter by shipment"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    """List delivery exceptions with optional filters."""
    exceptions = await exception_service.list_exceptions(
        status=status, shipment_id=shipment_id, severity=severity, limit=limit, skip=skip
    )
    return {"exceptions": exceptions, "count": len(exceptions)}


@router.patch("/{exception_id}/resolve")
async def resolve_exception(exception_id: str, body: ResolveExceptionRequest):
    """Resolve a delivery exception."""
    result = await exception_service.resolve_exception(
        exception_id=exception_id,
        resolution=body.resolution,
        resolved_by=body.resolved_by,
    )
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Exception not found"))
    return result
