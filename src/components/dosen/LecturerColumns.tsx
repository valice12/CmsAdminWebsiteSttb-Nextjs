"use client";

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

export interface LecturerDTO {
  id: number;
  lecturerName: string;
  organizationalRole: string;
  lecturerImagePath: string;
  roles: string[];
  degrees: string[];
}

interface LecturerColumnsProps {
  onEdit: (lecturer: LecturerDTO) => void;
  onDelete: (lecturer: LecturerDTO) => void;
}

export const getLecturerColumns = ({
  onEdit,
  onDelete,
}: LecturerColumnsProps): ColumnDef<LecturerDTO>[] => [
  {
    accessorKey: 'lecturerName',
    header: 'Dosen / Pengajar',
    cell: ({ row }) => (
      <div className="flex items-center gap-4 group text-left">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 shadow-sm transition-all group-hover:scale-110">
           <img 
             src={getImageUrl(row.original.lecturerImagePath, 'lecturers')} 
             alt={row.original.lecturerName}
             className="w-full h-full object-cover"
             onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Lecturer';
             }}
           />
        </div>
        <div>
          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{row.original.lecturerName}</p>
          <div className="flex flex-wrap gap-1 mt-1">
              {row.original.degrees.map((deg, i) => (
                  <span key={i} className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">{deg}</span>
              ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'organizationalRole',
    header: 'Spesialisasi',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-extrabold uppercase tracking-widest text-[9px] px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm">
         {row.original.organizationalRole}
      </Badge>
    ),
  },
  {
     accessorKey: 'roles',
     header: 'Jabatan Organisasi',
     cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
           {row.original.roles.map((r, i) => (
              <Badge key={i} variant="outline" className="text-[8px] font-black px-1.5 py-0 border-gray-100 text-gray-500 uppercase">
                 {r}
              </Badge>
           ))}
        </div>
     )
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
         <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            if (row.original.lecturerImagePath) {
              window.open(getImageUrl(row.original.lecturerImagePath, 'lecturers'), '_blank');
            } else {
              toast.info("Gambar tidak tersedia");
            }
          }}
          className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-emerald-100 hover:text-emerald-600 rounded-lg transition-colors"
          onClick={() => onEdit(row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
