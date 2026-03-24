"use client";

import { use } from "react";
import { AkademikForm } from "@/components/akademik/AkademikForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAkademikPage({ params }: PageProps) {
  const { id } = use(params);
  return <AkademikForm id={id} />;
}
