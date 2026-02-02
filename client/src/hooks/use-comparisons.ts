import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useComparison(id: number) {
  return useQuery({
    queryKey: [api.comparisons.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.comparisons.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch comparison");
      return api.comparisons.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateComparison() {
  return useMutation({
    mutationFn: async (productIds: number[]) => {
      const res = await fetch(api.comparisons.create.path, {
        method: api.comparisons.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create comparison");
      return api.comparisons.create.responses[201].parse(await res.json());
    },
  });
}
