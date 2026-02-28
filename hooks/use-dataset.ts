"use client";

import { useState, useEffect, useCallback } from "react";
import { DatasetRow } from "@/types";

interface UseDatasetResult {
  data: DatasetRow[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

async function clientFetchDataset(datasetId: string): Promise<DatasetRow[]> {
  const res = await fetch(`/api/dataset?id=${encodeURIComponent(datasetId)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.rows ?? [];
}

export function useDataset(datasetId: string, trigger?: number): UseDatasetResult {
  const [data, setData] = useState<DatasetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    clientFetchDataset(datasetId)
      .then((rows) => {
        if (!cancelled) setData(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [datasetId, refetchKey, trigger]);

  return { data, loading, error, refetch };
}

export function useMultipleDatasets(
  datasetIds: Record<string, string>,
  trigger?: number
) {
  const [data, setData] = useState<Record<string, DatasetRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => setRefetchKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const entries = Object.entries(datasetIds);
    Promise.all(entries.map(([, id]) => clientFetchDataset(id)))
      .then((results) => {
        if (!cancelled) {
          const mapped = Object.fromEntries(
            entries.map(([key], i) => [key, results[i]])
          );
          setData(mapped);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchKey, trigger]);

  return { data, loading, error, refetch };
}
