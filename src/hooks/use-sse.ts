"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface MatchSSE {
  id: string;
  teamId: string;
  opponent: string;
  date: string;
  location: string;
  status: string;
  currentSet: number;
  ourTotalSets: number;
  oppTotalSets: number;
  sets: Array<{ setNumber: number; ourPoints: number; oppPoints: number }>;
}

export function useLiveMatch(matchId: string): MatchSSE | null {
  const [data, setData] = useState<MatchSSE | null>(null);
  const retriesRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchIdRef = useRef(matchId);
  matchIdRef.current = matchId;

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    const es = new EventSource(`/api/matches/${matchIdRef.current}/stream`);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as MatchSSE;
        setData(parsed);
        retriesRef.current = 0;
      } catch {
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
      retriesRef.current += 1;
      timeoutRef.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (esRef.current) esRef.current.close();
    };
  }, [connect]);

  return data;
}
