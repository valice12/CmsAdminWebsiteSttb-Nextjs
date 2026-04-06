"use client";

import { use } from "react";
import { BeritaForm } from "@/components/berita/BeritaForm";

interface PageProps {
  params: { id: string };
}

export default function EditBeritaPage({ params }: PageProps) {
  const { id } = params;
  return <BeritaForm id={id} />;
}
