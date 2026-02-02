import { useState } from "react";
import { Search, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Directory() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [isAiCapable, setIsAiCapable] = useState(false);
  const [sort, setSort] = useState<"rating" | "newest" | "reviews">("rating");

  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    categoryId: categoryId === "all" ? undefined : categoryId,
    isAiCapable: isAiCapable || undefined,
    sort
  });

  const { data: categories } = useCategories();

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h3>
            
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AI Filter */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="ai-capable" 
                  checked={isAiCapable}
                  onCheckedChange={(c) => setIsAiCapable(!!c)}
                />
                <label
                  htmlFor="ai-capable"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  AI Capabilities Only
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <h1 className="text-3xl font-display font-bold">Product Directory</h1>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(isAiCapable || categoryId !== "all" || search) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {search && (
                <Badge variant="secondary" className="px-3 py-1">
                  Search: {search} <span className="ml-2 cursor-pointer" onClick={() => setSearch("")}>×</span>
                </Badge>
              )}
              {isAiCapable && (
                <Badge variant="secondary" className="px-3 py-1">
                  AI Capable <span className="ml-2 cursor-pointer" onClick={() => setIsAiCapable(false)}>×</span>
                </Badge>
              )}
              {categoryId !== "all" && (
                <Badge variant="secondary" className="px-3 py-1">
                  Category: {categories?.find(c => String(c.id) === categoryId)?.name} 
                  <span className="ml-2 cursor-pointer" onClick={() => setCategoryId("all")}>×</span>
                </Badge>
              )}
              <Button variant="link" size="sm" onClick={() => {
                setSearch("");
                setCategoryId("all");
                setIsAiCapable(false);
              }} className="text-muted-foreground h-auto p-0">
                Clear all
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
              <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
              <p className="text-sm text-muted-foreground/80 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
