"use client";

import { use } from 'react';
import { BiayaForm } from '@/components/biaya/BiayaForm';

export default function BiayaDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <BiayaForm id={id} />;
}
