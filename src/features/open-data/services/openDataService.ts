import { parsePcAxis } from '../utils/pcAxis';
import type { OpenDataDataset } from '../types';

export const OPEN_DATA_FILE = '/data/open-data/federated-sports-spain.px';

export async function loadOpenData(
  signal?: AbortSignal,
): Promise<OpenDataDataset> {
  const response = await fetch(OPEN_DATA_FILE, { signal });
  if (!response.ok) {
    throw new Error(`Open-data file could not be loaded (${response.status}).`);
  }

  const bytes = await response.arrayBuffer();
  const source = new TextDecoder('iso-8859-15').decode(bytes);
  return parsePcAxis(source);
}
