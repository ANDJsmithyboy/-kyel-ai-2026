'use client';

import React from 'react';

interface MessageContentProps {
  content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
  // Simple text rendering with whitespace preservation
  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {content}
    </div>
  );
}
