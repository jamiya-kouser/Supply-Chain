"""
LangGraph agent state schema.

Defines the typed state object carried across every node in
the voice agent graph. Uses LangGraph's Annotated[..., add_messages]
pattern for automatic message list merging.
"""

from typing import TypedDict, Annotated, List, Optional, Dict, Any
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class VoiceAgentState(TypedDict):
    """
    State carried across all nodes in the voice agent graph.

    Fields:
        messages          — Full conversation history (auto-merged by add_messages).
        user_transcript   — Latest user utterance from Deepgram STT.
        driver_id         — Verified driver ID (set by verify_driver_identity_node).
        driver_name       — Human-readable driver name.
        driver_info       — Full driver profile after verification.
        assigned_shipments — List of shipment IDs assigned to driver.
        is_driver_session — True if caller is a driver vs. manager.
        exception_context — Holds active exception being reported.
        intent            — Classified intent (e.g. "shipment_tracking").
        entities          — Extracted entities from the user utterance.
        tool_results      — Results from executing LangChain tools.
        response_text     — Final spoken response to send to TTS.
        needs_clarification — Whether to re-prompt the user for more info.
        error             — Error message if any node fails.
    """

    messages: Annotated[List[BaseMessage], add_messages]
    user_transcript: str
    driver_id: Optional[str]
    driver_name: Optional[str]
    driver_info: Optional[Dict[str, Any]]
    assigned_shipments: List[str]
    is_driver_session: bool
    exception_context: Optional[Dict[str, Any]]
    intent: Optional[str]
    entities: Dict[str, Any]
    tool_results: Dict[str, Any]
    response_text: str
    needs_clarification: bool
    error: Optional[str]
