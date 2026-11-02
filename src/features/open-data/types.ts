export interface OpenDataRecord {
  category: string;
  metric: string;
  period: string;
  year: number;
  value: number | null;
}

export interface OpenDataDataset {
  title: string;
  source: string;
  note: string;
  categories: string[];
  metrics: string[];
  periods: string[];
  records: OpenDataRecord[];
  dimensions: {
    category: string;
    metric: string;
    period: string;
  };
}

export interface SeriesPoint extends OpenDataRecord {
  yoy: number | null;
}

export interface ComparisonPoint {
  category: string;
  value: number | null;
}
