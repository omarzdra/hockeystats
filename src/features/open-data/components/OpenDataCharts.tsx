import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import {
  localizeCategory,
  localizeMetric,
  translations,
  type Language,
} from '../i18n';
import type { ComparisonPoint, SeriesPoint } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface OpenDataChartsProps {
  language: Language;
  category: string;
  metric: string;
  latestPeriod: string;
  series: SeriesPoint[];
  comparison: ComparisonPoint[];
}

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.14)' } },
  },
};

export function OpenDataCharts({
  language,
  category,
  metric,
  latestPeriod,
  series,
  comparison,
}: OpenDataChartsProps) {
  const copy = translations[language];
  const categoryLabel = localizeCategory(category, language);
  const metricLabel = localizeMetric(metric, language);

  return (
    <section className="charts-grid" aria-label="Open-data charts">
      <article className="chart-card chart-card-wide">
        <header>
          <div>
            <span className="eyebrow">{copy.trend}</span>
            <h2>{categoryLabel} {copy.throughTime}</h2>
          </div>
          <span className="metric-chip">{metricLabel}</span>
        </header>
        <div className="chart-frame">
          <Line
            aria-label={`${metricLabel}: ${copy.trend.toLocaleLowerCase(language)} — ${categoryLabel}`}
            role="img"
            options={commonOptions}
            data={{
              labels: series.map((point) => point.period),
              datasets: [
                {
                  label: metricLabel,
                  data: series.map((point) => point.value),
                  borderColor: '#68e1fd',
                  backgroundColor: '#68e1fd',
                  pointBackgroundColor: '#07111f',
                  pointBorderColor: '#68e1fd',
                  pointBorderWidth: 2,
                  pointRadius: 3,
                  tension: 0.28,
                  spanGaps: true,
                },
              ],
            }}
          />
        </div>
      </article>

      <article className="chart-card">
        <header>
          <div>
            <span className="eyebrow">{copy.comparison} · {latestPeriod}</span>
            <h2>{copy.relatedCategories}</h2>
          </div>
        </header>
        <div className="chart-frame">
          <Bar
            aria-label={`${metricLabel}: ${copy.comparison.toLocaleLowerCase(language)} — ${latestPeriod}`}
            role="img"
            options={{
              ...commonOptions,
              indexAxis: 'y' as const,
            }}
            data={{
              labels: comparison.map((point) =>
                localizeCategory(point.category, language),
              ),
              datasets: [
                {
                  label: metricLabel,
                  data: comparison.map((point) => point.value),
                  backgroundColor: comparison.map((point) =>
                    point.category === category ? '#68e1fd' : '#7768ff',
                  ),
                  borderRadius: 6,
                },
              ],
            }}
          />
        </div>
      </article>
    </section>
  );
}
