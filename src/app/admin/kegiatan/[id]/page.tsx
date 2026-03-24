"use client";

import { use } from "react";
import { KegiatanForm } from "@/components/kegiatan/KegiatanForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditKegiatanPage({ params }: PageProps) {
  const { id } = use(params);
  return <KegiatanForm id={id} />;
}
