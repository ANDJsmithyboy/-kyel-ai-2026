'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

type TabState = 'LEADER' | 'FOLLOWER' | 'ELECTION';

export function useTabSync(channelName: string = 'gaboma_ai_sync') {
  const [tabState, setTabState] = useState<TabState>('ELECTION');
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tabId = useRef<string>(Math.random().toString(36).substring(2, 9));
  const electionTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    channelRef.current = new BroadcastChannel(channelName);
    const channel = channelRef.current;

    const startElection = () => {
      setTabState('ELECTION');
      // Announce we want to be leader
      channel.postMessage({ type: 'ELECTION_START', senderId: tabId.current });
      
      // If nobody answers in 300ms, we become the leader
      electionTimeoutRef.current = setTimeout(() => {
        setTabState('LEADER');
        setIsReadOnly(false);
        channel.postMessage({ type: 'LEADER_CLAIMED', senderId: tabId.current });
      }, 300);
    };

    channel.onmessage = (event) => {
      const { type, senderId } = event.data;
      
      switch (type) {
        case 'ELECTION_START':
          // If we are already the leader, tell them
          if (tabState === 'LEADER') {
            channel.postMessage({ type: 'LEADER_CLAIMED', senderId: tabId.current });
          }
          break;
          
        case 'LEADER_CLAIMED':
          if (senderId !== tabId.current) {
            clearTimeout(electionTimeoutRef.current);
            setTabState('FOLLOWER');
            setIsReadOnly(true);
          }
          break;

        case 'LEADER_PING':
          if (tabState === 'ELECTION') {
            clearTimeout(electionTimeoutRef.current);
            setTabState('FOLLOWER');
            setIsReadOnly(true);
          }
          break;

        case 'LEADER_DEAD':
          if (tabState === 'FOLLOWER') {
            startElection();
          }
          break;
      }
    };

    // Initial election
    startElection();

    // Heartbeat if leader
    const heartbeat = setInterval(() => {
      if (tabState === 'LEADER') {
        channel.postMessage({ type: 'LEADER_PING', senderId: tabId.current });
      }
    }, 2000);

    const onUnload = () => {
      if (tabState === 'LEADER') {
        channel.postMessage({ type: 'LEADER_DEAD', senderId: tabId.current });
      }
      channel.close();
    };

    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(heartbeat);
      clearTimeout(electionTimeoutRef.current);
      window.removeEventListener('beforeunload', onUnload);
      channel.close();
    };
  }, [channelName, tabState]);

  // Method to sync SSE streaming text to other tabs
  const broadcastState = useCallback((type: string, payload: any) => {
    if (channelRef.current && tabState === 'LEADER') {
      channelRef.current.postMessage({ type: 'SYNC_STATE', payload, action: type });
    }
  }, [tabState]);

  return { isReadOnly, tabState, broadcastState, channel: channelRef.current };
}
