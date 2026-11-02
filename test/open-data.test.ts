import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  localizeCategory,
  localizeMetric,
} from '../src/features/open-data/i18n';
import {
  calculateYearOverYear,
  getSeries,
} from '../src/features/open-data/utils/openDataCalculations';
import {
  findCategory,
  parsePcAxis,
  parsePcAxisNumber,
} from '../src/features/open-data/utils/pcAxis';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

async function loadOfficialDataset() {
  const bytes = await readFile(
    path.join(
      projectRoot,
      'public',
      'data',
      'open-data',
      'federated-sports-spain.px',
    ),
  );
  return parsePcAxis(new TextDecoder('iso-8859-15').decode(bytes));
}

describe('official PC-Axis open-data file', () => {
  it('parses metadata, dimensions and every observation with Px.js', async () => {
    const dataset = await loadOfficialDataset();

    expect(dataset.title).toContain('Clubs deportivos federados');
    expect(dataset.dimensions).toEqual({
      category: 'Federación',
      metric: 'Clubs deportivos federados',
      period: 'periodo',
    });
    expect(dataset.records).toHaveLength(
      dataset.categories.length * dataset.metrics.length * dataset.periods.length,
    );
  });

  it('contains the ice-sports category and chronologically sorts its years', async () => {
    const dataset = await loadOfficialDataset();
    const iceSports = findCategory(dataset.categories, 'Deportes de hielo');

    expect(iceSports).toBe('Deportes de Hielo');
    const series = getSeries(dataset, iceSports!, dataset.metrics[0]);
    expect(series.map((point) => point.year)).toEqual(
      [...series.map((point) => point.year)].sort((a, b) => a - b),
    );
    expect(series.at(-1)?.period).toBe('2024');
    expect(series.at(-1)?.value).toBe(47);
  });
});

describe('PC-Axis numeric conversion and calculations', () => {
  it('converts decimal values while mapping PC-Axis missing markers to null', () => {
    expect(parsePcAxisNumber('47.0')).toBe(47);
    expect(parsePcAxisNumber('12,5')).toBe(12.5);
    expect(parsePcAxisNumber('".."')).toBeNull();
    expect(parsePcAxisNumber('-')).toBeNull();
    expect(parsePcAxisNumber('not-a-number')).toBeNull();
  });

  it('calculates year-over-year percentage and avoids invalid divisions', () => {
    expect(calculateYearOverYear(110, 100)).toBeCloseTo(10);
    expect(calculateYearOverYear(90, 100)).toBeCloseTo(-10);
    expect(calculateYearOverYear(null, 100)).toBeNull();
    expect(calculateYearOverYear(5, 0)).toBeNull();
  });

  it('rejects malformed input with a user-safe parser error', () => {
    expect(() => parsePcAxis('not a pc-axis file')).toThrow(
      'valid PC-Axis dataset',
    );
  });
});

describe('open-data localisation', () => {
  it('keeps source keys in Spanish while providing English display labels', () => {
    expect(localizeCategory('Deportes de Hielo', 'en')).toBe('Ice Sports');
    expect(localizeCategory('Deportes de Hielo', 'es')).toBe(
      'Deportes de Hielo',
    );
    expect(localizeMetric('Nº medio de licencias', 'en')).toBe(
      'Average number of licenses',
    );
  });
});
