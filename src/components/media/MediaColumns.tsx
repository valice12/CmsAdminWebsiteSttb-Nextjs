"use client";

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Edit } from 'lucide-react';
import { formatDateTime, getImageUrl } from '@/lib/utils';

export interface MediaDTO {
  id: number;
  slug: string;
  mediaName: string;
  mediaFormat: string;
  publishedAt: string;
  isPublished: boolean;
  createdAt: string;
  authors?: { fullName: string }[];
  mediaDescription?: string;
  category?: string[];
  thumbnailPath?: string;
}

interface GetMediaColumnsProps {
  onDelete: (media: MediaDTO) => void;
  onView: (media: MediaDTO) => void;
}

export const getMediaColumns = ({
  onDelete,
  onView,
}: GetMediaColumnsProps): ColumnDef<MediaDTO>[] => [
  {
    accessorKey: 'thumbnailPath',
    header: 'Preview',
    cell: ({ row }) => (
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm group relative">
        <img
          src={getImageUrl(row.original.thumbnailPath || '', row.original.mediaFormat)}
          alt={row.original.mediaName}
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Media';
          }}
        />
        <div 
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => window.open(getImageUrl(row.original.thumbnailPath || '', row.original.mediaFormat), '_blank')}
        >
          <ExternalLink className="w-4 h-4 text-white" />
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'mediaName',
    header: 'Judul & Penulis',
    cell: ({ row }) => (
      <div className="max-w-xs text-left">
        <p 
          className="font-bold text-gray-900 truncate hover:text-primary cursor-pointer transition-colors"
          onClick={() => onView(row.original)}
        >
          {row.original.mediaName}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 font-extrabold uppercase tracking-widest text-left">
          {row.original.authors?.map(a => a.fullName).join(', ') || 'No Author'}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'mediaFormat',
    header: 'Tipe',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px] bg-green-50 text-green-700 border-green-200">
        {row.original.mediaFormat}
      </Badge>
    ),
  },
  {
    accessorKey: 'publishedAt',
    header: 'Upload Date',
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-500">{formatDateTime(row.original.publishedAt || row.original.createdAt)}</span>
    ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onView(row.original)}
          className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(row.original)}
          className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
