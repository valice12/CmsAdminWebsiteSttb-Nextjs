"use client";

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GraduationCap, Award } from 'lucide-react';

export interface AkademikDTO {
  id: number;
  programName: string;
  degree: string;
  totalCredit: number;
}

interface AcademicColumnsProps {
  onEdit: (program: AkademikDTO) => void;
  onDelete: (program: AkademikDTO) => void;
}

export const getAcademicColumns = ({
  onEdit,
  onDelete,
}: AcademicColumnsProps): ColumnDef<AkademikDTO>[] => [
  {
    accessorKey: 'programName',
    header: 'Program Studi',
    cell: ({ row }) => (
      <div className="flex items-center gap-4 group text-left">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm transition-all group-hover:scale-110 group-hover:bg-primary/5 group-hover:border-primary/10">
          <GraduationCap className="w-6 h-6 text-primary transition-colors" />
        </div>
        <div>
          <p 
            className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer" 
            onClick={() => onEdit(row.original)}
          >
            {row.original.programName}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5 text-left">
            ID: {row.original.id}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'degree',
    header: 'Jenjang',
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-2.5 py-0.5 shadow-none">
        {row.original.degree}
      </Badge>
    ),
  },
  {
    accessorKey: 'totalCredit',
    header: 'SKS',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <Award className="w-4 h-4 text-amber-500" />
        {row.original.totalCredit || '-'} SKS
      </div>
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
          onClick={() => onEdit(row.original)}
          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
