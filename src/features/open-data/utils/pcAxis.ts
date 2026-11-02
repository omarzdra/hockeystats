import Px, { type PxEntry } from 'px';

import type { OpenDataDataset, OpenDataRecord } from '../types';

const MISSING_VALUES = new Set(['', '..', '...', '-', ':', 'na', 'n/a']);

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es');
}

function tableMetadata(
  parsed: Px,
  keyword: string,
  fallback = '',
): string {
  const value = parsed.metadata[keyword]?.TABLE;
  return typeof value === 'string' ? value.trim() : fallback;
}

function findDimension(
  parsed: Px,
  predicate: (variable: string, values: string[]) => boolean,
  description: string,
): string {
  const variable = parsed
    .variables()
    .find((candidate) => predicate(candidate, parsed.values(candidate)));

  if (!variable) {
    throw new Error(`PC-Axis dataset is missing the ${description} dimension.`);
  }

  return variable;
}

export function parsePcAxisNumber(rawValue: string): number | null {
  const value = rawValue.replace(/["']/g, '').trim();
  if (MISSING_VALUES.has(value.toLocaleLowerCase())) {
    return null;
  }

  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parsePcAxis(source: string): OpenDataDataset {
  let parsed: Px;
  try {
    parsed = new Px(source);
  } catch {
    throw new Error('The downloaded file is not a valid PC-Axis dataset.');
  }

  const variables = parsed.variables();
  if (variables.length < 3) {
    throw new Error('PC-Axis dataset does not contain the required dimensions.');
  }

  const periodDimension = findDimension(
    parsed,
    (variable, values) =>
      normalize(variable).includes('period') &&
      values.some((value) => /^\d{4}$/.test(value.trim())),
    'period',
  );
  const metricDimension = findDimension(
    parsed,
    (_variable, values) =>
      values.some((value) => normalize(value).includes('clubs')) &&
      values.some((value) => normalize(value).includes('licencias')),
    'metric',
  );
  const categoryDimension = findDimension(
    parsed,
    (_variable, values) =>
      values.some((value) => normalize(value) === 'deportes de hielo'),
    'sports category',
  );

  const categories = parsed.values(categoryDimension);
  const metrics = parsed.values(metricDimension);
  const periods = parsed.values(periodDimension);
  const expectedEntries = categories.length * metrics.length * periods.length;
  const entries = parsed.entries();

  if (entries.length !== expectedEntries) {
    throw new Error('PC-Axis data length does not match its metadata dimensions.');
  }

  const records: OpenDataRecord[] = entries.map((entry: PxEntry) => {
    const period = entry[periodDimension];
    const year = Number.parseInt(period, 10);
    if (!Number.isFinite(year)) {
      throw new Error(`Invalid PC-Axis period: ${period}`);
    }

    return {
      category: entry[categoryDimension],
      metric: entry[metricDimension],
      period,
      year,
      value: parsePcAxisNumber(entry.num),
    };
  });

  return {
    title: parsed.title(),
    source: tableMetadata(parsed, 'SOURCE'),
    note: tableMetadata(parsed, 'NOTE'),
    categories,
    metrics,
    periods,
    records,
    dimensions: {
      category: categoryDimension,
      metric: metricDimension,
      period: periodDimension,
    },
  };
}

export function findCategory(
  categories: string[],
  requested: string,
): string | undefined {
  const normalizedRequested = normalize(requested);
  return categories.find(
    (category) => normalize(category) === normalizedRequested,
  );
}

export function normalizeForSearch(value: string): string {
  return normalize(value);
}
