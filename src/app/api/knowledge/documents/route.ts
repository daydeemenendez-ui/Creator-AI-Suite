import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BUCKET = (process.env.SUPABASE_BUCKET_DOCUMENTS ?? "creator-documents").trim();

export async function GET() {
  const docs = await prisma.knowledgeDocument.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ docs });
}

export async function POST(req: NextRequest) {
  const { type, name, path, sizeBytes } = await req.json() as {
    type: string; name: string; path: string; sizeBytes: number;
  };
  if (!type || !name || !path) {
    return NextResponse.json({ error: "type, name and path are required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const fileUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;

  const doc = await prisma.knowledgeDocument.create({
    data: { type, name, path, fileUrl, sizeBytes: sizeBytes ?? 0 },
  });
  return NextResponse.json({ doc });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const doc = await prisma.knowledgeDocument.delete({ where: { id } }).catch(() => null);
  if (doc) {
    try {
      await createServiceClient().storage.from(BUCKET).remove([doc.path]);
    } catch {
      // DB record is already gone — storage cleanup failure shouldn't fail the request
    }
  }
  return NextResponse.json({ ok: true });
}
