import DeerFlowCanvas from '@/components/flow/DeerFlowCanvas';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DeerFlow Canvas | Nkyel AI Admin',
  description: 'Éditeur visuel de workflows d\'agents autonomes pour Nkyel AI.',
};

export default function AdminFlowPage() {
  return (
    <div className="h-[calc(100vh-8rem)] w-full p-4">
      <DeerFlowCanvas />
    </div>
  );
}
