// utils/useSearchQuery.js
import { useSearchParams } from "next/navigation";

export const useSearchQuery = (queryParam) => {
  const searchParams = useSearchParams();
  const search = searchParams.get(queryParam);
  return search ? decodeURIComponent(search) : null;
};
