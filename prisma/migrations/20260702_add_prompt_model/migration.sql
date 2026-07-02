-- CreateTable
CREATE TABLE "prompts" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- Seed the prompts that used to be hardcoded in PromptsPage.tsx, so they aren't lost
INSERT INTO "prompts" ("id", "category", "title", "text", "starred", "updatedAt") VALUES
('seed-prompt-1', 'YouTube', 'Gancho de apertura viral', 'Escribe 5 ganchos de apertura para un video sobre [TEMA]. Cada gancho debe crear curiosidad o urgencia en los primeros 5 segundos. El público objetivo es [AUDIENCIA].', true, CURRENT_TIMESTAMP),
('seed-prompt-2', 'Guiones', 'Guión completo estructura PRO', 'Crea un guión completo de [DURACIÓN] minutos sobre [TEMA]. Incluye: gancho (0-30s), presentación del problema, desarrollo con 3 puntos clave, ejemplos prácticos y CTA final. Tono: [TONO].', true, CURRENT_TIMESTAMP),
('seed-prompt-3', 'SEO', 'Descripción SEO para YouTube', 'Escribe una descripción optimizada para SEO de un video de YouTube sobre [TEMA]. Incluye la keyword principal en el primer párrafo, 3-5 keywords secundarias, timestamps y CTA. Máximo 400 palabras.', false, CURRENT_TIMESTAMP),
('seed-prompt-4', 'Ideas', '10 ideas de video con alto CTR', 'Genera 10 ideas de video para un canal de [NICHO]. Cada idea debe incluir: título con alta probabilidad de click, descripción de 2 líneas, formato sugerido (short/largo/serie) y nivel de dificultad de producción.', false, CURRENT_TIMESTAMP),
('seed-prompt-5', 'Redes', 'Hilo de Twitter/X viral', 'Convierte este contenido de video en un hilo de Twitter de 8-10 tweets: [CONTENIDO]. El primer tweet debe ser el gancho. Cada tweet debe poder leerse de forma independiente. Incluye emojis relevantes.', false, CURRENT_TIMESTAMP),
('seed-prompt-6', 'Email', 'Email newsletter de nuevo video', 'Escribe un email para mi lista de suscriptores anunciando mi nuevo video sobre [TEMA]. Incluye: asunto atractivo, preview text, 2 párrafos de contexto, 3 puntos que aprenderán y botón CTA. Tono [TONO].', true, CURRENT_TIMESTAMP),
('seed-prompt-7', 'SEO', 'Keywords para YouTube', 'Encuentra 20 keywords para YouTube relacionadas con [TEMA]. Clasifícalas en: alta competencia, media y baja. Para cada una indica el tipo de intención de búsqueda y si es adecuada para el título, descripción o tags.', false, CURRENT_TIMESTAMP),
('seed-prompt-8', 'Guiones', 'Script de Shorts (60 segundos)', 'Crea un script para un YouTube Short de máximo 60 segundos sobre [TEMA]. Estructura: gancho (0-3s) → problema o dato sorprendente (3-15s) → solución o revelación (15-50s) → CTA (50-60s). Sin introducciones.', false, CURRENT_TIMESTAMP);
