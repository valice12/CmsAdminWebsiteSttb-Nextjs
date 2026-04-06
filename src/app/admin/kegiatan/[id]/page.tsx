"use client";

import { use } from "react";
import { KegiatanForm } from "@/components/kegiatan/KegiatanForm";

interface PageProps {
  params: { id: string };
}

export default function EditKegiatanPage({ params }: PageProps) {
  const { id } = params;
  return <KegiatanForm id={id} />;
}
