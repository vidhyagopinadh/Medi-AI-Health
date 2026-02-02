import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useReviews, useCreateReview } from "@/hooks/use-reviews";
import { useAuth } from "@/hooks/use-auth";
import { 
  Star, 
  Globe, 
  Building2, 
  CheckCircle2, 
  Zap, 
  Loader2, 
  MessageSquarePlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const reviewSchema = z.object({
  rating: z.string(),
  content: z.string().min(10, "Review must be at least 10 characters"),
  pros: z.string().optional(),
  cons: z.string().optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = Number(params?.id);
  const { data: product, isLoading } = useProduct(id);
  const { data: reviews } = useReviews(id);
  const { user } = useAuth();
  const [reviewOpen, setReviewOpen] = useState(false);

  const createReview = useCreateReview();
  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
  });

  const onSubmit = (data: ReviewForm) => {
    createReview.mutate(
      { productId: id, data },
      {
        onSuccess: () => {
          setReviewOpen(false);
          toast({ title: "Review submitted successfully" });
          form.reset();
        },
        onError: (err) => {
          toast({ title: "Error submitting review", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-2xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {product.logoUrl ? (
                <img src={product.logoUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-muted-foreground">{product.name.charAt(0)}</span>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">{product.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md text-amber-700 border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold">{product.rating ? (product.rating / 10).toFixed(1) : "N/A"}</span>
                </div>
                <span className="text-muted-foreground">{product.reviewCount} Reviews</span>
                <span className="text-border">|</span>
                {product.websiteUrl && (
                  <a href={product.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <Globe className="w-4 h-4" /> Visit Website
                  </a>
                )}
                {product.isAiCapable && (
                   <Badge className="bg-blue-600 hover:bg-blue-700 ml-2">
                     <Zap className="w-3 h-3 mr-1" /> AI Powered
                   </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                {product.description}
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
               <Button size="lg" className="shadow-lg shadow-primary/20">Get Demo</Button>
               <Button size="lg" variant="outline">Compare</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
                <TabsTrigger value="features">Features & AI</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 animate-in fade-in-50">
                 <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                   <h3 className="text-lg font-semibold font-display mb-4">About {product.name}</h3>
                   <p className="text-muted-foreground leading-relaxed">
                     {product.description}
                     <br/><br/>
                     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                   </p>
                 </div>
                 
                 <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                   <h3 className="text-lg font-semibold font-display mb-4">Key Information</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <span className="text-sm text-muted-foreground block mb-1">Deployment Type</span>
                       <span className="font-medium flex items-center gap-2">
                         <Globe className="w-4 h-4 text-primary" /> {product.deploymentType || "Not specified"}
                       </span>
                     </div>
                     <div>
                       <span className="text-sm text-muted-foreground block mb-1">Pricing Model</span>
                       <span className="font-medium flex items-center gap-2">
                         <Building2 className="w-4 h-4 text-primary" /> {product.pricingTier || "Contact Vendor"}
                       </span>
                     </div>
                     <div>
                       <span className="text-sm text-muted-foreground block mb-1">Integration</span>
                       <span className="font-medium flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-primary" /> {product.integrationType || "API Available"}
                       </span>
                     </div>
                   </div>
                 </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 animate-in fade-in-50">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold font-display">User Reviews</h3>
                   {user ? (
                     <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                       <DialogTrigger asChild>
                         <Button gap="2"><MessageSquarePlus className="w-4 h-4" /> Write Review</Button>
                       </DialogTrigger>
                       <DialogContent>
                         <DialogHeader>
                           <DialogTitle>Write a review for {product.name}</DialogTitle>
                           <DialogDescription>Share your experience to help others.</DialogDescription>
                         </DialogHeader>
                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                           <div className="space-y-2">
                             <Label>Rating</Label>
                             <Select onValueChange={(v) => form.setValue("rating", v)}>
                               <SelectTrigger>
                                 <SelectValue placeholder="Select rating" />
                               </SelectTrigger>
                               <SelectContent>
                                 {[5,4,3,2,1].map(num => (
                                   <SelectItem key={num} value={String(num)}>{num} Stars</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             {form.formState.errors.rating && <p className="text-xs text-destructive">{form.formState.errors.rating.message}</p>}
                           </div>
                           <div className="space-y-2">
                             <Label>Review</Label>
                             <Textarea {...form.register("content")} placeholder="What did you like or dislike?" />
                             {form.formState.errors.content && <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>}
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Pros</Label>
                                <Input {...form.register("pros")} placeholder="Brief highlights" />
                              </div>
                              <div className="space-y-2">
                                <Label>Cons</Label>
                                <Input {...form.register("cons")} placeholder="Brief downsides" />
                              </div>
                           </div>
                           <Button type="submit" className="w-full" disabled={createReview.isPending}>
                             {createReview.isPending ? "Submitting..." : "Submit Review"}
                           </Button>
                         </form>
                       </DialogContent>
                     </Dialog>
                   ) : (
                     <div className="text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
                       <a href="/api/login" className="text-primary hover:underline font-medium">Log in</a> to write a review
                     </div>
                   )}
                 </div>
                 
                 {reviews?.length === 0 && (
                   <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">No reviews yet. Be the first!</div>
                 )}
                 
                 {reviews?.map((review) => (
                   <div key={review.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <div className="flex items-center gap-1 text-amber-500 mb-1">
                           {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-muted/30"}`} />
                           ))}
                         </div>
                         <div className="text-sm font-medium">Verified User</div>
                         <div className="text-xs text-muted-foreground">{format(new Date(review.createdAt || new Date()), "MMM d, yyyy")}</div>
                       </div>
                     </div>
                     <p className="text-foreground leading-relaxed mb-4">{review.content}</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                       {review.pros && (
                         <div className="flex gap-2">
                           <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                           <div><span className="font-semibold text-green-700">Pros:</span> {review.pros}</div>
                         </div>
                       )}
                       {review.cons && (
                         <div className="flex gap-2">
                           <div className="w-4 h-4 border border-red-200 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-red-600 text-[10px] font-bold">−</div>
                           <div><span className="font-semibold text-red-700">Cons:</span> {review.cons}</div>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
              </TabsContent>
              
              <TabsContent value="features">
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold font-display mb-4">AI Capabilities</h3>
                  {product.isAiCapable && product.aiCapabilities ? (
                    <div className="flex flex-wrap gap-2">
                      {(product.aiCapabilities as string[]).map((cap, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm">
                          <Zap className="w-3 h-3 mr-2 text-blue-600" />
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specific AI features listed for this product.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold mb-4">Similar Products</h3>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
