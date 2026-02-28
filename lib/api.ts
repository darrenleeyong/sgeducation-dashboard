import { DatasetRow } from "@/types";

const BASE_URL = "https://api-production.data.gov.sg/v2/public/api/datasets";

interface ListRowsResponse {
  code: number;
  data?: {
    rows?: DatasetRow[];
    links?: { next?: string };
  };
  errorMsg?: string;
}

export async function fetchDatasetRows(
  datasetId: string,
  maxPages: number = 5
): Promise<DatasetRow[]> {
  const allRows: DatasetRow[] = [];
  let nextUrl: string | null = `${BASE_URL}/${datasetId}/list-rows`;
  let pageCount = 0;

  while (nextUrl && pageCount < maxPages) {
    pageCount++;
    const currentUrl = nextUrl;
    nextUrl = null;

    const res: Response = await fetch(currentUrl, {
      headers: {
        "x-api-key": process.env.DATA_GOV_API_KEY ?? "",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch dataset ${datasetId}: ${res.status} ${res.statusText}`
      );
    }

    const json: ListRowsResponse = await res.json();

    if (json.code !== 0 || json.errorMsg) {
      throw new Error(json.errorMsg ?? `API error for dataset ${datasetId}`);
    }

    // Simple deduplication - keep unique rows by vault_id only
    const seen = new Set<string>();
    for (const row of json.data?.rows ?? []) {
      const id = row.vault_id || row.id || '';
      if (!seen.has(id)) {
        seen.add(id);
        allRows.push(row);
      }
    }

    const nextCursor = json.data?.links?.next;
    if (nextCursor) {
      nextUrl = `${BASE_URL}/${datasetId}/list-rows?${decodeURIComponent(nextCursor)}`;
    } else {
      nextUrl = null;
    }
  }

  return allRows;
}

export async function fetchMultipleDatasets(
  datasetIds: Record<string, string>
): Promise<Record<string, DatasetRow[]>> {
  const entries = Object.entries(datasetIds);
  const results = await Promise.all(
    entries.map(([, id]) => fetchDatasetRows(id))
  );

  return Object.fromEntries(entries.map(([key], i) => [key, results[i]]));
}
