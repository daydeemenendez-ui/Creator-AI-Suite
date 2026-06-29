-- Make transcriptId optional in content_outputs
ALTER TABLE "content_outputs" ALTER COLUMN "transcript_id" DROP NOT NULL;
