"use server";

import { prisma } from "@/lib/prisma";

type Activity = {
  id: string;
  type: "research" | "content" | "voice" | "idea";
  title: string;
  status: string;
  createdAt: string;
  href: string;
};

export async function getDashboardData() {
  const [
    sourcesCount,
    outputsCount,
    voicesCount,
    ideasCount,
    recentSources,
    recentOutputs,
    recentVoices,
    recentIdeas,
    projects,
  ] = await Promise.all([
    prisma.source.count(),
    prisma.contentOutput.count(),
    prisma.voiceProfile.count(),
    prisma.idea.count(),
    prisma.source.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.contentOutput.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.voiceProfile.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.idea.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { sources: true } } },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    READY: "completado",
    PROCESSING: "procesando",
    PENDING: "pendiente",
    ERROR: "error",
  };

  const activity: Activity[] = [
    ...recentSources.map((s) => ({
      id: s.id,
      type: "research" as const,
      title: `Análisis: '${s.title ?? s.fileName ?? "Video sin título"}'`,
      status: statusLabels[s.status] ?? "pendiente",
      createdAt: s.createdAt.toISOString(),
      href: "/research",
    })),
    ...recentOutputs.map((o) => ({
      id: o.id,
      type: "content" as const,
      title: `Contenido generado: '${o.title ?? "Sin título"}'`,
      status: "listo",
      createdAt: o.createdAt.toISOString(),
      href: "/content",
    })),
    ...recentVoices.map((v) => ({
      id: v.id,
      type: "voice" as const,
      title: `Voz clonada: ${v.name}`,
      status: statusLabels[v.status] ?? "pendiente",
      createdAt: v.createdAt.toISOString(),
      href: "/voice",
    })),
    ...recentIdeas.map((i) => ({
      id: i.id,
      type: "idea" as const,
      title: `Idea: '${i.title}'`,
      status: i.generatedGuion || i.generatedPost ? "convertida" : "pendiente",
      createdAt: i.createdAt.toISOString(),
      href: "/ideas",
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return {
    stats: {
      analyses: sourcesCount,
      content: outputsCount,
      voices: voicesCount,
      ideas: ideasCount,
    },
    activity,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      videos: p._count.sources,
      status: p._count.sources === 0 ? "Nuevo" : "Activo",
      updatedAt: p.updatedAt.toISOString(),
    })),
  };
}

export async function createProject(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string) || "#FF0033";
  if (!name) return { error: "name is required" };

  try {
    const project = await prisma.project.create({ data: { name, color } });
    return { success: true, project };
  } catch (err) {
    return { error: String(err) };
  }
}
