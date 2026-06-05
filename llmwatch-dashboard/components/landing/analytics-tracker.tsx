'use client';

import { useEffect } from 'react';

export function AnalyticsTracker() {
  useEffect(() => {
    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: '/' }),
    }).catch(() => {}); // fire-and-forget — never disrupt the page
  }, []);

  return null;
}
