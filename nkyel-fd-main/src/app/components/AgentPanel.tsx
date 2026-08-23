"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, PlayCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Task Checklist Component (Manus-style) ---

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  inProgress: boolean;
}

interface TaskChecklistProps {
  todos: TodoItem[];
}

export function TaskChecklist({ todos }: TaskChecklistProps) {
  if (!todos || todos.length === 0) return null;
  
  const completed = todos.filter(t => t.done).length;
  const progress = (completed / todos.length) * 100;

  return (
    <Card className="w-full bg-surface-low border-none shadow-none rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Plan</h3>
        <span className="text-xs text-primary">{completed}/{todos.length}</span>
        <div className="flex-1 ml-2 h-1 bg-surface-high rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {todos.map((todo) => (
          <div 
            key={todo.id} 
            className="flex items-start gap-2 py-1 animate-in slide-in-from-bottom-2 fade-in duration-300"
          >
            <div className="mt-0.5">
              {todo.done ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : todo.inProgress ? (
                <PlayCircle className="w-4 h-4 text-tertiary animate-pulse" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/50" />
              )}
            </div>
            <span className={cn(
              "text-sm leading-tight",
              todo.done && "line-through text-muted-foreground/60",
              todo.inProgress && "text-foreground",
              !todo.done && !todo.inProgress && "text-muted-foreground"
            )}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

import SandboxViewer from './SandboxViewer';

// --- Live Agent Panel (Wide Search Interface) ---

export function LiveAgentPanel({ events }: { events: any[] }) {
  // Extract todos and tool calls from events stream
  const todos = events.findLast(e => e.type === 'todo_update')?.data.todos || [];
  const activeTools = events.filter(e => e.type === 'tool_start' && !events.some(end => end.type === 'tool_end' && end.data.tool_call_id === e.data.tool_call_id));

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] border-l border-[var(--border)] relative">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center glass backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          Agent Live View
        </h2>
        <Button variant="outline" size="sm" className="h-7 text-xs rounded-full takeover-btn">
          Takeover
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Task Checklist */}
        <TaskChecklist todos={todos} />
        
        {/* Workspace Sandbox Viewer (Brick 9) */}
        <SandboxViewer />
        
        {/* Active Tools execution */}
        {activeTools.map((tool: any) => (
          <Card key={tool.data.tool_call_id} className="p-3 bg-surface-low border-none">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-tertiary" />
              <span className="text-xs font-mono text-tertiary">{tool.data.tool_name}</span>
            </div>
            <div className="mt-2 text-xs font-mono text-muted-foreground line-clamp-2">
              {JSON.stringify(tool.data.args_preview)}
            </div>
          </Card>
        ))}
        
        {activeTools.length === 0 && todos.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-10">
            Agent is currently idle.
          </div>
        )}
      </div>
    </div>
  );
}
