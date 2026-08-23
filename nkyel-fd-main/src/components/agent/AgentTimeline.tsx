"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, XCircle, SpinnerGap } from "@phosphor-icons/react";

interface AgentEvent {
  id: string;
  type: "thinking" | "tool_call" | "result" | "done" | "error";
  data: string | any;
  timestamp: Date;
}

interface AgentTimelineProps {
  sessionId: string;
}

export function AgentTimeline({ sessionId }: AgentTimelineProps) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Dans la vraie vie, l'URL dépend de l'environnement (env var) ou d'un proxy
    const eventSource = new EventSource(`/api/v1/agent/run?session_id=${sessionId}`);

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        const newEvent: AgentEvent = {
          id: crypto.randomUUID(),
          type: parsed.event,
          data: parsed.data,
          timestamp: new Date(),
        };

        setEvents((prev) => [...prev, newEvent]);

        if (parsed.event === "done" || parsed.event === "error") {
          setIsActive(false);
          eventSource.close();
        }
      } catch (err) {
        console.error("Erreur parsing SSE:", err);
      }
    };

    eventSource.onerror = () => {
      setIsActive(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  const renderIcon = (type: string) => {
    switch (type) {
      case "thinking":
        return <SpinnerGap weight="thin" className="w-5 h-5 animate-spin text-[var(--accent)]" />;
      case "tool_call":
        return <Clock weight="thin" className="w-5 h-5 text-[var(--text-ai)] opacity-70" />;
      case "result":
        return <CheckCircle weight="thin" className="w-5 h-5 text-[var(--color-success)]" />;
      case "done":
        return <CheckCircle weight="thin" className="w-6 h-6 text-[var(--color-success)]" />;
      case "error":
        return <XCircle weight="thin" className="w-6 h-6 text-[var(--color-danger)]" />;
      default:
        return <Clock weight="thin" className="w-5 h-5 text-[var(--text-ai)]" />;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-[var(--bg-panel)] rounded-xl border border-[var(--accent)]/20 shadow-lg font-sans">
      <h3 className="text-lg font-medium text-[var(--text-ai)] mb-4 flex items-center gap-2">
        {isActive ? (
          <>
            <SpinnerGap weight="thin" className="w-5 h-5 animate-spin text-[var(--accent)]" />
            <span className="text-[var(--accent)]">BLACK PANTHER orchestre la mission...</span>
          </>
        ) : (
          <span className="text-[var(--text-ai)] opacity-80">Mission terminée</span>
        )}
      </h3>

      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {events.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 relative"
            >
              {/* Ligne connectrice verticale */}
              {idx !== events.length - 1 && (
                <div className="absolute left-2.5 top-6 bottom-[-16px] w-[1px] bg-[var(--text-ai)]/20"></div>
              )}
              
              <div className="flex-shrink-0 mt-0.5 bg-[var(--bg-panel)] z-10">
                {renderIcon(evt.type)}
              </div>
              
              <div className="flex-1 text-sm text-[var(--text-ai)]">
                {evt.type === "result" && typeof evt.data === "object" ? (
                  <pre className="bg-black/30 p-2 rounded-md border border-[var(--text-ai)]/10 text-xs overflow-x-auto whitespace-pre-wrap">
                    {evt.data.stdout || JSON.stringify(evt.data)}
                  </pre>
                ) : (
                  <p className={evt.type === "error" ? "text-[var(--color-danger)]" : ""}>
                    {String(evt.data)}
                  </p>
                )}
                <span className="text-xs text-[var(--text-ai)] opacity-40 mt-1 block">
                  {evt.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
