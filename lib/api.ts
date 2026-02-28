import { DatasetRow } from "@/types";

const BASE_URL = "https://api-open.data.gov.sg/v2/public/api/datasets";

interface ListRowsResponse {
  code: number;
  data?: {
    rows?: DatasetRow[];
    links?: { next?: string };
  };
  errorMsg?: string;
}

export async function fetchDatasetRows(
  datasetId: string
): Promise<DatasetRow[]> {
  const allRows: DatasetRow[] = [];
  let nextUrl: string | null = `${BASE_URL}/${datasetId}/list-rows`;

  while (nextUrl) {
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

    allRows.push(...(json.data?.rows ?? []));

    nextUrl = json.data?.links?.next ?? null;
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
