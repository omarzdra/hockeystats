import {
  localizeCategory,
  localizeMetric,
  translations,
  type Language,
} from '../i18n';

interface OpenDataFiltersProps {
  language: Language;
  categories: string[];
  metrics: string[];
  selectedCategory: string;
  selectedMetric: string;
  onCategoryChange: (value: string) => void;
  onMetricChange: (value: string) => void;
}

export function OpenDataFilters({
  language,
  categories,
  metrics,
  selectedCategory,
  selectedMetric,
  onCategoryChange,
  onMetricChange,
}: OpenDataFiltersProps) {
  const copy = translations[language];

  return (
    <section className="filters" aria-label="Open data filters">
      <label>
        <span>{copy.sportCategory}</span>
        <select
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {localizeCategory(category, language)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{copy.metric}</span>
        <select
          value={selectedMetric}
          onChange={(event) => onMetricChange(event.target.value)}
        >
          {metrics.map((metric) => (
            <option key={metric} value={metric}>
              {localizeMetric(metric, language)}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
