// Path: src/lib/utils/createUrlFromPathnameAndSearchParams.ts

type SearchParamsLike = {
  toString(): string
}

type CreateUrlFromPathnameAndSearchParamsInput = {
  pathname: string
  searchParams: SearchParamsLike
}

export function createUrlFromPathnameAndSearchParams({
  pathname,
  searchParams
}: CreateUrlFromPathnameAndSearchParamsInput): string {
  const query = searchParams.toString()

  return query.length > 0 ? `${pathname}?${query}` : pathname
}
