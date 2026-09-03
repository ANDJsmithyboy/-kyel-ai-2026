/**
 * Ñkyel AI — Google Review Token Subpath Route
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Handles: https://nkyel.smartandjai.com/review/google/[token]
 * and https://nkyel.smartandjai.com/review/google/g_rev_7SMNAzSmcavmHI8xWVqzy28k1CMPTheFNNeIclTmw-0
 */

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import GoogleReviewPage, { CANONICAL_GOOGLE_TOKEN } from '../page';

export default function GoogleReviewTokenSubpathPage() {
  const params = useParams();
  const token = (params?.token as string) || CANONICAL_GOOGLE_TOKEN;

  return <GoogleReviewPage initialToken={token} />;
}
