export type MusicTrack = {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  audioUrl: string;
  durationMs: number | null;
};

export type MusicCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tracks: MusicTrack[];
};
