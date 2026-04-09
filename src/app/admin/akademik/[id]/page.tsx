"use client";

import { use } from "react";
import { AkademikForm } from "@/components/akademik/AkademikForm";

interface PageProps {
  params: { id: string };
}

export default function EditAkademikPage({ params }: PageProps) {
  const { id } = params;
  return <AkademikForm id={id} />;
}
