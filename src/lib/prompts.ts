/**
 * Centralized AI prompt templates for Creator AI Suite.
 * All prompts receive the transcript as context and return structured output.
 */

export const PROMPTS = {
  IDEAS: (transcript: string, count = 8) => `
Eres un experto en estrategia de contenido para YouTube con 10 años de experiencia.

Basándote ÚNICAMENTE en la siguiente transcripción, genera ${count} ideas de videos originales y de alto potencial viral.

TRANSCRIPCIÓN:
${transcript}

INSTRUCCIONES:
- Cada idea debe tener: título (máx 60 chars), descripción (2-3 líneas), tipo de formato, estimación de CTR
- Prioriza ideas con alto potencial de retención y CTR
- Incluye al menos 2 ideas de Shorts
- Responde en JSON con este schema exacto:

{
  "ideas": [
    {
      "title": "string",
      "description": "string",
      "format": "video_largo | short | serie",
      "ctr_potential": "bajo | medio | alto | muy_alto",
      "tags": ["string"]
    }
  ]
}
`,

  SCRIPT: (transcript: string, ideaTitle: string) => `
Eres un guionista profesional para YouTube. Tu tarea es crear un guión completo y optimizado.

IDEA/TÍTULO: ${ideaTitle}

TRANSCRIPCIÓN BASE (referencia de contenido):
${transcript}

ESTRUCTURA DEL GUIÓN:
1. HOOK (primeros 15 segundos — CRÍTICO para retención)
2. INTRO (presentación del problema/promesa — 30-60s)
3. DESARROLLO (3-5 puntos clave con ejemplos concretos)
4. CTA (call to action claro y específico)
5. OUTRO (máx 15 segundos)

REGLAS:
- Tono natural, conversacional, directo
- Cada punto clave debe tener transición suave
- Incluir notas de [B-ROLL] donde aplique
- Máximo 2000 palabras para video de 10-12 minutos

Responde en JSON:
{
  "title": "string",
  "estimated_duration": "string",
  "word_count": number,
  "sections": [
    {
      "type": "hook | intro | main_point | cta | outro",
      "title": "string",
      "content": "string",
      "duration_estimate": "string"
    }
  ]
}
`,

  SHORTS: (transcript: string, count = 5) => `
Eres experto en contenido viral para YouTube Shorts y TikTok.

Basándote en la transcripción, extrae o crea ${count} ideas de Shorts de 60 segundos máximo.

TRANSCRIPCIÓN:
${transcript}

CRITERIOS DE SELECCIÓN:
- Momentos de alta energía o insights clave
- Frases impactantes o estadísticas sorprendentes
- Clips que funcionen sin contexto previo
- Hook en los primeros 3 segundos

Responde en JSON:
{
  "shorts": [
    {
      "title": "string",
      "hook": "string (primeras 3 palabras que enganchen)",
      "script": "string (guión completo ~150 palabras)",
      "timestamp_reference": "string (si aplica del video original)",
      "format": "talking_head | text_overlay | broll_narration"
    }
  ]
}
`,

  SEO: (transcript: string, title: string) => `
Eres un experto en SEO para YouTube con profundo conocimiento del algoritmo 2024-2025.

Crea un pack SEO completo para el siguiente video basándote en la transcripción.

TÍTULO DEL VIDEO: ${title}

TRANSCRIPCIÓN:
${transcript}

ENTREGABLES (responde en JSON):
{
  "title_options": ["string x5 — variaciones optimizadas para CTR y keywords"],
  "description": "string — descripción completa 300-500 palabras con keywords naturales",
  "tags": ["string x20 — mix de broad y long-tail keywords"],
  "chapters": [
    { "timestamp": "0:00", "title": "string" }
  ],
  "thumbnail_ideas": ["string x3 — descripción de ideas de miniatura"],
  "primary_keyword": "string",
  "secondary_keywords": ["string x5"]
}
`,

  VOICE_REWRITE: (text: string, personality: string) => `
Eres un redactor especializado en contenido de audio para creadores hispanohablantes.

PERSONALIDAD DE LA VOZ:
${personality}

TEXTO ORIGINAL A REESCRIBIR:
${text}

TAREA: Reescribe el texto preservando TODAS las ideas, datos e información, pero adaptando completamente el tono, estilo, ritmo y vocabulario a la personalidad de la voz descrita.

REGLAS:
- Mantén la longitud similar al original (±20%)
- Adapta el vocabulario y registro al personaje — usa su jerga, sus frases características
- No agregues ni quites información — solo adapta el estilo
- Responde ÚNICAMENTE con el texto reescrito, sin explicaciones ni encabezados
`,

  VOICE_COMPOSE: (personality: string) => `
Eres un copywriter experto en contenido de audio y marketing de infoproductos para el mercado hispanohablante.

PERSONALIDAD DE LA VOZ:
${personality}

TAREA: Escribe entre 3 y 6 oraciones EN PERSONAJE que sirvan como gancho de apertura, frase de cierre o contenido de marketing.

REQUISITOS:
- Completamente en personaje según la personalidad descrita
- En español latino, natural y conversacional al ritmo de esa voz
- Orientado a captar atención o motivar una acción (compra, suscripción, seguimiento)
- Incluye una llamada a la acción si el personaje lo haría naturalmente
- Varía el resultado cada vez que se llama — no repitas estructuras

Responde ÚNICAMENTE con el texto, sin explicaciones ni títulos.
`,

  VOICE_PERSONALITY_FROM_TRANSCRIPT: (transcript: string) => `
Eres un director de casting de voz. A continuación tienes la transcripción de una muestra de audio de una persona real (lo que dijo, no cómo lo dijo).

TRANSCRIPCIÓN DE LA MUESTRA:
${transcript}

TAREA: A partir de las palabras que eligió, su vocabulario, jerga, forma de construir las frases y el tema del que habla, infiere y describe en 2-3 oraciones la personalidad de esta voz para usarla como guía de estilo en futuras generaciones de audio (por ejemplo: nivel de formalidad, energía, público al que se dirige, muletillas o frases características, tono general).

REGLAS:
- Basa la descripción SOLO en pistas razonables del texto (vocabulario, registro, estructura de frases, tema), no inventes hechos biográficos
- Escribe en segunda persona, como si describieras "cómo habla esta voz"
- Responde ÚNICAMENTE con la descripción, sin explicaciones ni encabezados
`,

  EMAIL: (transcript: string, channelName = "tu canal") => `
Eres copywriter especializado en email marketing para creadores de contenido.

Escribe un email para la lista de suscriptores anunciando el nuevo video basándote en la transcripción.

CANAL: ${channelName}

TRANSCRIPCIÓN BASE:
${transcript}

ESTRUCTURA DEL EMAIL:
- Subject line (máx 50 chars, alta tasa de apertura)
- Preview text (90 chars)
- Cuerpo: gancho, valor principal, CTA al video
- P.D. con curiosidad o bonus

Responde en JSON:
{
  "subject": "string",
  "preview_text": "string",
  "body": "string (HTML básico con párrafos)",
  "cta_text": "string",
  "ps": "string"
}
`,
};
