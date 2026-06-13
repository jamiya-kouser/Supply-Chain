"""
LangGraph voice agent graph construction.

Updated graph structure (per new.md Section 5):
  START
    → verify_driver_identity_node
    → driver_briefing
    → classify_intent
    → (conditional route):
      - shipment query → execute_tools → generate_response → END
      - status update → execute_tools → generate_response → END
      - exception report → process_exception_node → END
      - delay / ETA report → recalculate_eta_node → END
      - needs clarification → clarify → END
      - unknown intent → handle_error → generate_response → END

The compiled graph is exposed as `voice_agent` for use by routers.
"""

from langgraph.graph import StateGraph, END
from app.agent.state import VoiceAgentState
from app.agent.nodes import (
    verify_driver_identity_node,
    driver_briefing,
    classify_intent,
    execute_tools,
    generate_response,
    handle_error,
    clarify,
    process_exception_node,
    recalculate_eta_node,
)


# ── Routing functions ────────────────────────────────────

def route_after_classification(state: VoiceAgentState) -> str:
    """Route after intent classification based on intent type."""
    intent = state.get("intent")
    needs_clarification = state.get("needs_clarification", False)
    
    # If clarification needed, ask user
    if needs_clarification:
        return "clarify"
    
    # Route based on intent type
    if intent == "report_delivery_exception":
        return "process_exception"
    elif intent == "calculate_dynamic_eta":
        return "recalculate_eta"
    elif intent:
        # Standard tools: shipment tracking, scheduling, inventory, orders, status
        return "execute"
    else:
        # No intent detected - conversational response
        return "respond"


def route_after_execution(state: VoiceAgentState) -> str:
    """Route to response generation or error handling."""
    if state.get("error"):
        return "error"
    return "success"


# ── Graph construction ───────────────────────────────────

def build_voice_agent_graph():
    """Build and compile the LangGraph state graph."""

    graph = StateGraph(VoiceAgentState)

    # Add nodes
    graph.add_node("verify_driver_identity", verify_driver_identity_node)
    graph.add_node("driver_briefing", driver_briefing)
    graph.add_node("classify_intent", classify_intent)
    graph.add_node("execute_tools", execute_tools)
    graph.add_node("generate_response", generate_response)
    graph.add_node("handle_error", handle_error)
    graph.add_node("clarify", clarify)
    graph.add_node("process_exception", process_exception_node)
    graph.add_node("recalculate_eta", recalculate_eta_node)

    # Entry point
    graph.set_entry_point("verify_driver_identity")

    # Edges: verify → briefing → classify
    graph.add_edge("verify_driver_identity", "driver_briefing")
    graph.add_edge("driver_briefing", "classify_intent")

    # Conditional: classify → execute | clarify | exception | eta | respond directly
    graph.add_conditional_edges(
        "classify_intent",
        route_after_classification,
        {
            "execute": "execute_tools",
            "clarify": "clarify",
            "process_exception": "process_exception",
            "recalculate_eta": "recalculate_eta",
            "respond": "generate_response",
        },
    )

    # Conditional: execute_tools → generate_response | handle_error
    graph.add_conditional_edges(
        "execute_tools",
        route_after_execution,
        {
            "success": "generate_response",
            "error": "handle_error",
        },
    )

    # Terminal edges
    graph.add_edge("generate_response", END)
    graph.add_edge("handle_error", "generate_response")
    graph.add_edge("clarify", END)
    graph.add_edge("process_exception", END)
    graph.add_edge("recalculate_eta", END)

    return graph.compile()


# ── Compiled graph (singleton) ───────────────────────────
voice_agent = build_voice_agent_graph()
