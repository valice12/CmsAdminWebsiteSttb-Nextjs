"use client";

import { use } from 'react';
import { Suspense } from 'react';
import { PenggunaForm } from '@/components/pengguna/PenggunaForm';

export default function DosenEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm id={resolvedParams.id} type="lecturer" />
    </Suspense>
  );
}
