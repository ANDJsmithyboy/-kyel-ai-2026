/**
 * Ñkyel AI — Google Review Production Route
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Dedicated isolated production-backed environment for Google Reviewers.
 * Serves /review/google/ directly with automatic validation of the canonical Google review grant.
 */

'use client';

import React from 'react';
import GoogleReviewEnvironment from '@/components/review/GoogleReviewEnvironment';

export default function GoogleReviewPage() {
  return <GoogleReviewEnvironment />;
}
