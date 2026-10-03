export type ContentStatus = 'draft' | 'reviewed' | 'planned';

/** Every spoken-capable entry keeps visual copy separate from speech copy. */
export interface SpokenContent { displayText: string; spokenText: string; }

export interface NarrationEntry extends SpokenContent {
  id: string;
  trigger: string;
  status: ContentStatus;
}

/** `displayText` is the visible term label; short and analogy are visible card copy. */
export interface GlossaryEntry extends SpokenContent {
  termId: string;
  term: string;
  short: string;
  analogy: string;
  status: ContentStatus;
}

export interface Resource { id: string; labelKey: string; url: string; kind: string; verified: boolean; checkedOn: string; }
