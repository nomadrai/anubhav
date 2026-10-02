export type ContentStatus = 'draft' | 'reviewed' | 'planned';
export interface NarrationEntry { id: string; displayText: string; spokenText: string; trigger: string; status: ContentStatus; }
export interface Resource { id: string; labelKey: string; url: string; kind: string; verified: boolean; checkedOn: string; }
