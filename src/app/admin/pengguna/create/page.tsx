"use client";

import { Suspense } from 'react';
import { PenggunaForm } from '@/components/pengguna/PenggunaForm';

export default function PenggunaCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm />
    </Suspense>
  );
}
