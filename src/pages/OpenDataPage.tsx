import { useEffect, useMemo, useState } from 'react';

import { OpenDataCharts } from '../features/open-data/components/OpenDataCharts';
import { OpenDataFilters } from '../features/open-data/components/OpenDataFilters';
import { OpenDataKpis } from '../features/open-data/components/OpenDataKpis';
import {
  translations,
  type Language,
} from '../features/open-data/i18n';
import { loadOpenData } from '../features/open-data/services/openDataService';
import type { OpenDataDataset } from '../features/open-data/types';
import {
  getComparison,
  getSeries,
} from '../features/open-data/utils/openDataCalculations';
import { findCategory } from '../features/open-data/utils/pcAxis';

interface OpenDataPageProps {
  language: Language;
}

export function OpenDataPage({ language }: OpenDataPageProps) {
  const copy = translations[language];
  const [dataset, setDataset] = useState<OpenDataDataset | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    loadOpenData(controller.signal)
      .then((loadedDataset) => {
        const defaultCategory =
          findCategory(loadedDataset.categories, 'Deportes de hielo') ??
          loadedDataset.categories[0];
        setDataset(loadedDataset);
        setSelectedCategory(defaultCategory);
        setSelectedMetric(loadedDataset.metrics[0]);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setHasError(true);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const series = useMemo(
    () =>
      dataset && selectedCategory && selectedMetric
        ? getSeries(dataset, selectedCategory, selectedMetric)
        : [],
    [dataset, selectedCategory, selectedMetric],
  );
  const latestPeriod =
    [...series].reverse().find((point) => point.value !== null)?.period ?? '';
  const comparison = useMemo(
    () =>
      dataset && selectedMetric && latestPeriod && selectedCategory
        ? getComparison(
            dataset,
            selectedMetric,
            latestPeriod,
            selectedCategory,
          )
        : [],
    [dataset, selectedMetric, latestPeriod, selectedCategory],
  );

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{copy.heroEyebrow}</span>
          <h1>{copy.heroTitle} <em>{copy.heroTitleSuffix}</em></h1>
          <p>{copy.heroDescription}</p>
        </div>
        <div className="source-badge" aria-label="Dataset format">
          <span>{copy.liveFile}</span>
          <strong>.PX</strong>
          <small>{copy.parsedOnLoad}</small>
        </div>
      </section>

      <section className="dataset-strip" aria-label="Dataset details">
        <div>
          <span>{copy.dataset}</span>
          <strong>{copy.datasetName}</strong>
        </div>
        <div><span>{copy.country}</span><strong>{copy.spain}</strong></div>
        <div><span>{copy.source}</span><strong>data.europa.eu</strong></div>
        <div><span>{copy.format}</span><strong>PC-Axis (.px)</strong></div>
      </section>

      {!dataset && !hasError && (
        <section className="state-card" role="status">
          <span className="loader" aria-hidden="true" />
          <div>
            <strong>{copy.loading}</strong>
            <p>{copy.loadingDetail}</p>
          </div>
        </section>
      )}

      {hasError && (
        <section className="state-card error-state" role="alert">
          <div>
            <strong>{copy.errorTitle}</strong>
            <p>{copy.errorFallback}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setDataset(null);
              setReloadKey((key) => key + 1);
            }}
          >
            {copy.retry}
          </button>
        </section>
      )}

      {dataset && (
        <>
          <OpenDataFilters
            language={language}
            categories={dataset.categories}
            metrics={dataset.metrics}
            selectedCategory={selectedCategory}
            selectedMetric={selectedMetric}
            onCategoryChange={setSelectedCategory}
            onMetricChange={setSelectedMetric}
          />
          <OpenDataKpis language={language} series={series} />
          <OpenDataCharts
            language={language}
            category={selectedCategory}
            metric={selectedMetric}
            latestPeriod={latestPeriod}
            series={series}
            comparison={comparison}
          />

          <section className="method-note">
            <span className="eyebrow">{copy.aboutView}</span>
            <h2>{copy.contextTitle}</h2>
            <p>{copy.contextDescription}</p>
            <details>
              <summary>{copy.provenance}</summary>
              <p>{dataset.source}</p>
              <p>{dataset.note}</p>
            </details>
          </section>
        </>
      )}
    </main>
  );
}
