import type { SourceType } from './knowledgeBase';

export const MIC_LABELS = {
  'handheld-dynamic': 'Handheld (dynamic)',
  headset: 'Headset',
  lavalier: 'Lavalier / clip-on',
  condenser: 'Condenser',
  di: 'DI / line',
} as const;
export type MicType = keyof typeof MIC_LABELS;

/** Compact names for inline use, e.g. "Sarah (handheld)". */
export const MIC_SHORT: Record<MicType, string> = {
  'handheld-dynamic': 'handheld',
  headset: 'headset',
  lavalier: 'clip-on',
  condenser: 'condenser',
  di: 'DI',
};

export interface BandSource {
  id: string;
  label: string;
  type: SourceType;
  mic?: MicType;
}

export interface BandSetup {
  id: string;
  name: string;
  sources: BandSource[];
}
