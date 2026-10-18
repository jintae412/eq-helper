export type ListenMode = 'music' | 'speech';

export interface RoomReference {
  savedAt: string; // ISO date
  bandsDb: number[]; // aligned with BAND_CENTERS
}

export interface KnownResonance {
  freqHz: number;
  note: string;
}

/** A venue: its acoustics, not its gear (gear travels with the band's mixer profile). */
export interface RoomProfile {
  id: string;
  name: string;
  knownResonances: KnownResonance[];
  references: Partial<Record<ListenMode, RoomReference>>;
}
