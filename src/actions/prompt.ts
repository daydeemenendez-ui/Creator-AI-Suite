"use server";

import { prisma } from "@/lib/prisma";

export async function listPrompts() {
  const prompts = await prisma.prompt.findMany({ orderBy: { createdAt: "desc" } });
  return { prompts };
}

export async function createPrompt(formData: FormData) {
  const title = formData.get("title") as string;
  const category = (formData.get("category") as string) || "Ideas";
  const text = formData.get("text") as string;

  if (!title?.trim() || !text?.trim()) return { error: "title and text are required" };

  try {
    const prompt = await prisma.prompt.create({
      data: { title: title.trim(), category, text: text.trim() },
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
