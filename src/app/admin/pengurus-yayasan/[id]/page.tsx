"use client";

import { use } from 'react';
import { Suspense } from 'react';
import { PenggunaForm } from '@/components/pengguna/PenggunaForm';

export default function PengurusYayasanEditPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm id={id} type="foundation" />
    </Suspense>
  );
}
