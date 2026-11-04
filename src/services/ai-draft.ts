import { DEV_APP } from '@/data/dev-app';
import { apiFetch } from '@/services/api';

export interface SectionDraftInput {
  section: string; // concern | background | assessment | formulation | plan | ethics
  caseRef: string; // de-identified case code
  currentText: string;
  language: 'BM' | 'EN';
  notes?: string[]; // optional text from linked sessions
}

export interface SectionDraft {
  draft: string;
  is_mock: boolean; // true = sample text because AI is not configured
}

/** Asks the backend for an AI draft of one case-analysis section. The user must still review it. */
export async function requestSectionDraft(input: SectionDraftInput): Promise<SectionDraft> {
  if (DEV_APP) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { draft: '[Sample draft: dev mode] Replace this with the real details.', is_mock: true };
  }
  return apiFetch<SectionDraft>('/api/case-anal/ai-draft', {
    method: 'POST',
    body: {
      section: input.section,
      case_ref: input.caseRef,
      current_text: input.currentText,
      language: input.language,
      notes: input.notes ?? [],
    },
  });
}
