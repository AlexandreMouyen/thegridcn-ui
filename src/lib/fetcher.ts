export type FetchedData<T> = {
  data: T;
  totalCount: number;
  page: number;
  perPage: number;
  hasMore: boolean;
  headers: Record<string, string>;
};

export type FetcherError = Error & { status: number; info: object };

const TOTAL_COUNT_HEADER = "X-Total-Count";
const PAGE_HEADER = "X-Page";
const PER_PAGE_HEADER = "X-Per-Page";
const HAS_MORE_HEADER = "X-Has-More";

export async function fetcher<T>(url: string | URL): Promise<FetchedData<T>> {
  const res = await fetch(url);
  const headers: Record<string, string> = {};

  const totalCount = parseInt(res.headers.get(TOTAL_COUNT_HEADER) || "-1", 10);
  const page = parseInt(res.headers.get(PAGE_HEADER) ?? "1", 10);
  const perPage = parseInt(res.headers.get(PER_PAGE_HEADER) ?? "0", 10);
  const hasMore = res.headers.get(HAS_MORE_HEADER) === "true";

  res.headers.forEach((value, key) => {
    headers[key] = value;
  });

  if (!res.ok) {
    const error: Partial<FetcherError> = new Error(
      "Something went wrong when fetching the data.",
    );

    error.info = await res.json();
    error.status = res.status;
    throw error as FetcherError;
  }

  return {
    data: (await res.json()) as T,
    totalCount,
    page,
    perPage,
    hasMore,
    headers,
  };
}
