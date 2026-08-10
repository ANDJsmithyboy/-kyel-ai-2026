import os
import json
import asyncio
from typing import AsyncGenerator, Dict, Any, Optional

try:
    from deerflow.client import DeerFlowClient
except ImportError:
    DeerFlowClient = None

class DeerFlowService:
    def __init__(self):
        # Configure le chemin du projet pour que DeerFlow trouve config.yaml
        os.environ["DEER_FLOW_PROJECT_ROOT"] = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        
        if DeerFlowClient:
            self.client = DeerFlowClient()
        else:
            self.client = None
            print("⚠️ DeerFlowClient non disponible. Vérifiez que 'deerflow-harness' est installé.")

    async def stream_agent(self, prompt: str, thread_id: str, agent_name: str = "lead_agent") -> AsyncGenerator[str, None]:
        if not self.client:
            yield f"data: {json.dumps({'type': 'error', 'content': 'DeerFlow non initialisé'})}\n\n"
            return
            
        try:
            # Exécuter stream() dans un thread pour ne pas bloquer l'Event Loop
            loop = asyncio.get_running_loop()
            
            # On utilise une queue pour relayer les événements du thread synchrone vers l'async generator
            queue = asyncio.Queue()
            
            def run_sync_stream():
                try:
                    # Configurer l'agent à utiliser via kwargs
                    kwargs = {"thread_id": thread_id}
                    if agent_name != "lead_agent":
                        # Injection de l'agent name pour utiliser la config personnalisée
                        kwargs["agent_name"] = agent_name
                        
                    for event in self.client.stream(prompt, **kwargs):
                        # print("DEBUG EVENT:", event.type, event.data)
                        
                        # Formatage SSE pour le frontend
                        formatted_event = self._format_event(event)
                        if formatted_event:
                            asyncio.run_coroutine_threadsafe(queue.put(formatted_event), loop)
                            
                    asyncio.run_coroutine_threadsafe(queue.put(None), loop)
                except Exception as e:
                    error_msg = json.dumps({'type': 'error', 'content': str(e)})
                    asyncio.run_coroutine_threadsafe(queue.put(f"data: {error_msg}\n\n"), loop)
                    asyncio.run_coroutine_threadsafe(queue.put(None), loop)

            # Lancer le stream en arrière-plan
            asyncio.create_task(asyncio.to_thread(run_sync_stream))
            
            # Consommer la queue
            while True:
                data = await queue.get()
                if data is None:
                    break
                yield data

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    def _format_event(self, event: Any) -> Optional[str]:
        """Traduit les événements LangGraph natifs en payload GabomaAI."""
        try:
            # DeerFlowClient returns events with .type and .data attributes
            event_type = getattr(event, 'type', None)
            event_data = getattr(event, 'data', {})
            
            if event_type == "messages-tuple":
                msg = event_data
                if isinstance(msg, dict):
                    msg_type = msg.get("type", "")
                    content = msg.get("content", "")
                    tool_calls = msg.get("tool_calls", [])
                    
                    if msg_type == "ai":
                        if content:
                            return f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"
                        if tool_calls:
                            # Extraction des appels d'outils
                            for tool in tool_calls:
                                name = tool.get("name", "")
                                args = tool.get("args", {})
                                
                                if name == "web_search":
                                    return f"data: {json.dumps({'type': 'task_start', 'task': f'Recherche Web : {args.get('query', \"\")}'})}\n\n"
                                elif name == "python_repl" or name == "bash":
                                    return f"data: {json.dumps({'type': 'terminal', 'content': f'$ {args.get(\"command\", \"\")}'})}\n\n"
                                elif name == "write_file":
                                    return f"data: {json.dumps({'type': 'artifact', 'file': args.get('path', ''), 'content': args.get('content', '')})}\n\n"
                                elif name == "browser_navigate":
                                    return f"data: {json.dumps({'type': 'browser_navigate', 'url': args.get('url', '')})}\n\n"
                                else:
                                    return f"data: {json.dumps({'type': 'task_start', 'task': f'Utilisation de l\\'outil {name}...'})}\n\n"
                                    
            elif event_type == "values":
                # Fin d'étape ou mise à jour de l'état global
                pass
                
        except Exception:
            pass
        return None

# Instance singleton
deerflow_service = DeerFlowService()
