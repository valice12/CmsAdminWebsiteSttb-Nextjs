"use client";

import { use } from 'react';
import { BiayaForm } from '@/components/biaya/BiayaForm';

export default function BiayaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BiayaForm id={id} />;
}
