"use client";

import { use } from 'react';
import { MediaForm } from '@/components/media/MediaForm';

export default function MediaDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <MediaForm id={id} />;
}
