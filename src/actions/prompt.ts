"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function listPrompts() {
  const prompts = await prisma.prompt.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "desc" },
    include: { children: { orderBy: { createdAt: "asc" } } },
  });
  return { prompts };
}

export async function createPrompt(formData: FormData) {
  const title = formData.get("title") as string;
  const text = formData.get("text") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const imagesRaw = formData.get("images") as string | null;
  const images = imagesRaw ? (JSON.parse(imagesRaw) as Prisma.InputJsonValue) : undefined;

  if (!title?.trim() || !text?.trim()) return { error: "title and text are required" };

  try {
    let category = (formData.get("category") as string) || "Ideas";

    if (parentId) {
      const parent = await prisma.prompt.findUnique({ where: { id: parentId } });
      if (!parent) return { error: "parent prompt not found" };
      category = parent.category;
    }

    const prompt = await prisma.prompt.create({
      data: { title: title.trim(), category, text: text.trim(), parentId: parentId ?? undefined, images },
    });
    return { success: true, prompt };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function deletePrompt(id: string) {
  try {
    await prisma.prompt.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function togglePromptStarred(id: string, starred: boolean) {
  try {
    const prompt = await prisma.prompt.update({ where: { id }, data: { starred } });
    return { success: true, prompt };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function updatePromptImages(id: string, images: unknown) {
  try {
    const prompt = await prisma.prompt.update({
      where: { id },
      data: { images: images as Prisma.InputJsonValue },
    });
    return { success: true, prompt };
  } catch (err) {
    return { error: String(err) };
  }
}
