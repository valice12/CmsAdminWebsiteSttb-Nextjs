"use client";

import { PenggunaForm } from "@/components/pengguna/PenggunaForm";
import { use } from "react";
import { Suspense } from "react";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PenggunaForm id={resolvedParams.id} />
    </Suspense>
  );
}
