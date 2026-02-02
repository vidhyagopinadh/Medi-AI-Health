import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateReviewRequest } from "@shared/routes";

export function useReviews(productId: number) {
  return useQuery({
    queryKey: [api.reviews.list.path, productId],
    queryFn: async () => {
      const url = buildUrl(api.reviews.list.path, { id: productId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return api.reviews.list.responses[200].parse(await res.json());
    },
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: number; data: Omit<CreateReviewRequest, "productId" | "userId"> }) => {
      const url = buildUrl(api.reviews.create.path, { id: productId });
      
      // Manually validate part of schema since we don't have full object
      const payload = {
        ...data,
        rating: Number(data.rating),
      };

      const res = await fetch(url, {
        method: api.reviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Please login to review");
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message);
        }
        throw new Error("Failed to submit review");
      }
      return api.reviews.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      const url = buildUrl(api.reviews.list.path, { id: variables.productId });
      queryClient.invalidateQueries({ queryKey: [api.reviews.list.path, variables.productId] });
      queryClient.invalidateQueries({ queryKey: [api.products.get.path, variables.productId] });
    },
  });
}
