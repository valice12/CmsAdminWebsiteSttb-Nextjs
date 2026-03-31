"use client";

import { Suspense } from 'react';
import { PenggunaForm } from '@/components/pengguna/PenggunaForm';

export default function UserCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm type="user" />
    </Suspense>
  );
}
