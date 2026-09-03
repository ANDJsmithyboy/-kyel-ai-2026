/**
 * Ñkyel AI · Google Review Exact Submitted URL Landing
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * CRITICAL ROUTE: This page serves the immutable submitted Google application URL:
 * https://nkyel.smartandjai.com/review/google/g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0
 *
 * Renders the isolated, production-backed Google Review Environment directly on this URL.
 * NEVER REDIRECTS to another URL.
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import GoogleReviewEnvironment from '@/components/review/GoogleReviewEnvironment';

export default function GoogleReviewTokenPage() {
  const params = useParams();
  const token = (params?.token as string) || 'g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0';

  return <GoogleReviewEnvironment initialToken={token} />;
}
