import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateProductRequest } from "@shared/routes";
import { z } from "zod";

export function useProducts(filters?: { 
  search?: string; 
  categoryId?: string; 
  isAiCapable?: boolean;
  sort?: 'rating' | 'newest' | 'reviews';
}) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.categoryId) queryParams.set("categoryId", filters.categoryId);
  if (filters?.isAiCapable) queryParams.set("isAiCapable", "true");
  if (filters?.sort) queryParams.set("sort", filters.sort);

  const queryString = queryParams.toString();
  const url = `${api.products.list.path}${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: [api.products.list.path, filters],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return api.products.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      // Ensure number types are actually numbers
      const payload = {
        ...data,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      };
      
      const validated = api.products.create.input.parse(payload);
      
      const res = await fetch(api.products.create.path, {
        method: api.products.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create product");
      }
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    },
  });
}
