import type {
  ComparisonPoint,
  OpenDataDataset,
  SeriesPoint,
} from '../types';
import { normalizeForSearch } from './pcAxis';

export function calculateYearOverYear(
  current: number | null,
  previous: number | null,
): number | null {
  if (current === null || previous === null || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export function getSeries(
  dataset: OpenDataDataset,
  category: string,
  metric: string,
): SeriesPoint[] {
  const records = dataset.records
    .filter(
      (record) => record.category === category && record.metric === metric,
    )
    .sort((left, right) => left.year - right.year);

  return records.map((record, index) => ({
    ...record,
    yoy:
      index === 0
        ? null
        : calculateYearOverYear(record.value, records[index - 1].value),
  }));
}

function relatedCategoryScore(category: string, selected: string): number {
  if (category === selected) return 100;
  const normalized = normalizeForSearch(category);
  const terms = ['hielo', 'invierno', 'hockey', 'patinaje', 'esqui'];
  const index = terms.findIndex((term) => normalized.includes(term));
  return index === -1 ? 0 : 50 - index;
}

export function getComparison(
  dataset: OpenDataDataset,
  metric: string,
  period: string,
  selectedCategory: string,
  limit = 6,
): ComparisonPoint[] {
  const categories = dataset.categories
    .filter((category) => normalizeForSearch(category) !== 'total')
    .map((category, index) => ({
      category,
      index,
      score: relatedCategoryScore(category, selectedCategory),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ category }) => category);

  return categories.map((category) => ({
    category,
    value:
      dataset.records.find(
        (record) =>
          record.category === category &&
          record.metric === metric &&
          record.period === period,
      )?.value ?? null,
  }));
}
