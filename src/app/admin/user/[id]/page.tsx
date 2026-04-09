"use client";

import { PenggunaForm } from "@/components/pengguna/PenggunaForm";
import { use } from "react";
import { Suspense } from "react";

export default function EditUserPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm id={id} />
    </Suspense>
  );
}
