"use client";

import { Suspense } from 'react';
import { PenggunaForm } from '@/components/pengguna/PenggunaForm';

export default function PengurusYayasanCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm type="foundation" />
    </Suspense>
  );
}
