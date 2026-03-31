"use client";

import { use } from "react";
import JadwalForm from "@/components/admisi/JadwalForm";

export default function EditJadwalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <div className="container mx-auto py-10">
            <JadwalForm id={id} />
        </div>
    );
}
