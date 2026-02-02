import { Link } from "wouter";
import { Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div className="h-full bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-border">
                {product.logoUrl ? (
                  <img src={product.logoUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">
                    {product.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-medium">{product.rating ? (product.rating / 10).toFixed(1) : "N/A"}</span>
                  <span className="text-muted-foreground ml-1 text-xs">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            {product.isAiCapable && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 gap-1 px-2.5">
                <Zap className="w-3 h-3" /> AI
              </Badge>
            )}
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          <div className="mt-auto pt-4 border-t border-border/50 flex flex-wrap gap-2">
             {product.pricingTier && (
               <Badge variant="outline" className="text-xs font-normal">
                 {product.pricingTier}
               </Badge>
             )}
             {product.deploymentType && (
               <Badge variant="outline" className="text-xs font-normal">
                 {product.deploymentType}
               </Badge>
             )}
          </div>
        </div>
      </div>
    </Link>
  );
}
