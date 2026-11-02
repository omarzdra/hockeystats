import { translations, type Language } from '../i18n';
import type { SeriesPoint } from '../types';

interface OpenDataKpisProps {
  language: Language;
  series: SeriesPoint[];
}

function formatValue(value: number | null, language: Language): string {
  const copy = translations[language];
  return value === null
    ? copy.unavailable
    : new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(value);
}

export function OpenDataKpis({ language, series }: OpenDataKpisProps) {
  const copy = translations[language];
  const latest = [...series].reverse().find((point) => point.value !== null);

  const kpis = [
    {
      label: copy.latestValue,
      value: formatValue(latest?.value ?? null, language),
    },
    { label: copy.latestYear, value: latest?.period ?? copy.unavailable },
    {
      label: copy.yoyChange,
      value:
        latest?.yoy === null || latest?.yoy === undefined
          ? copy.unavailable
          : `${latest.yoy >= 0 ? '+' : ''}${latest.yoy.toFixed(1)}%`,
      tone:
        latest?.yoy === null || latest?.yoy === undefined
          ? undefined
          : latest.yoy >= 0
            ? 'positive'
            : 'negative',
    },
    { label: copy.dataSource, value: 'PC-Axis · data.europa.eu' },
  ];

  return (
    <section className="kpi-grid" aria-label="Current data summary">
      {kpis.map((kpi) => (
        <article className="kpi-card" key={kpi.label}>
          <span>{kpi.label}</span>
          <strong className={kpi.tone}>{kpi.value}</strong>
        </article>
      ))}
    </section>
  );
}
