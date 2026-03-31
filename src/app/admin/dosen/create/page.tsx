"use client";

import { Suspense } from 'react';
import { PenggunaForm } from '@/components/pengguna/PenggunaForm';

export default function DosenCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm type="lecturer" />
    </Suspense>
  );
}
