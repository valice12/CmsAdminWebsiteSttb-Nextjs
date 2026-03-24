"use client";

import { use } from "react";
import { BeritaForm } from "@/components/berita/BeritaForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBeritaPage({ params }: PageProps) {
  const { id } = use(params);
  return <BeritaForm id={id} />;
}
