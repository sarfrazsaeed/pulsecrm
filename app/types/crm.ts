export type PipelineStage = "New" | "Contacted" | "Proposal" | "Won" | "Lost";

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  dealValue: number;
  stage: PipelineStage;
  createdAt: string;
}

export interface ContactDraft {
  name: string;
  company: string;
  email: string;
  phone: string;
  dealValue: number;
  stage: PipelineStage;
}
