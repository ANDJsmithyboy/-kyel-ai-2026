import React from 'react';
import VIEScreen from '@/components/vie/VIEScreen';

// For this route, we will assume a generic missionId if none is provided via query params.
// In a real usage scenario, this would likely be a dynamic route like /workspace/[missionId]/vie
// or read from a searchParam like /vie?mission=123
export default function VIEPage({ searchParams }: { searchParams: { mission?: string } }) {
  const missionId = searchParams.mission || 'default-mission';
  
  return <VIEScreen missionId={missionId} />;
}
