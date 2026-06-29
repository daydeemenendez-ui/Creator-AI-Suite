"use server";

import { prisma } from "@/lib/prisma";
import { chat } from "@/lib/openrouter";

async function getOrCreateDefaultProject() {
  const existing = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.project.create({ data: { name: "Mi Proyecto" } });
}

export async function listIdeas() {
  const ideas = await prisma.idea.findMany({ orderBy: { createdAt: "desc" } });
  return { ideas };
}

export async function createIdea(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const tagsRaw = (formData.get("tags") as string) || "";
  const priority = (formData.get("priority") as string) || "media";

  if (!title?.trim()) return { error: "title is required" };

  try {
    const project = await getOrCreateDefaultProject();
    const idea = await prisma.idea.create({
      data: {
        projectId: project.id,
        title: title.trim(),
        description,
        tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
        priority,
      },
    });
    return { success: true, idea };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function deleteIdea(id: string) {
  try {
    await prisma.idea.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function updateIdeaPriority(id: string, priority: string) {
  try {
    const idea = await prisma.idea.update({ where: { id }, data: { priority } });
    return { success: true, idea };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function toggleIdeaStarred(id: string, starred: boolean) {
  try {
    const idea = await prisma.idea.update({ where: { id }, data: { starred } });
    return { success: true, idea };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function convertIdea(
  title: string,
  description: string,
  targetType: "guion" | "post"
) {
  const systemPrompt =
    "Eres un experto en creación de contenido para YouTube y redes sociales. Responde siempre en español.";

  const prompt =
    targetType === "guion"
      ? `Escribe un guión completo para YouTube basado en esta idea de video.\n\nTítulo: "${title}"\nContexto: ${description || "Sin descripción adicional."}\n\nIncluye: gancho inicial impactante, desarrollo con puntos clave, llamada a la acción al final. Usa formato claro con secciones.`
      : `Escribe un post atractivo para redes sociales (Instagram/LinkedIn) basado en esta idea.\n\nTítulo: "${title}"\nContexto: ${description || "Sin descripción adicional."}\n\nHaz el texto dinámico, con emojis relevantes, hashtags al final y una pregunta para generar comentarios.`;

  try {
    const content = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      { temperature: 0.75, maxTokens: 2000 }
    );
    return { success: true, content };
  } catch (err) {
    return { error: String(err) };
  }
}
