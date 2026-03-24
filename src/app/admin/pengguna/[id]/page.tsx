"use client";

import { use, Suspense } from 'react';
import { PenggunaForm } from '@/components/pengguna/PenggunaForm';

export default function PenggunaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm id={id} />
    </Suspense>
  );
}
