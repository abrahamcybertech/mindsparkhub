import { clearOfflineDraft, loadOfflineDraft, saveOfflineDraft } from './secure-store';
import type { SubmissionPayload } from '@/types';

export interface FormDraft {
  formData: Partial<SubmissionPayload>;
  savedAt: string;
}

export async function saveFormDraft(formData: Partial<SubmissionPayload>): Promise<void> {
  const draft: FormDraft = {
    formData,
    savedAt: new Date().toISOString(),
  };
  await saveOfflineDraft(draft);
}

export async function getFormDraft(): Promise<FormDraft | null> {
  return loadOfflineDraft<FormDraft>();
}

export async function deleteFormDraft(): Promise<void> {
  await clearOfflineDraft();
}
