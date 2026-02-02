import { useAuth } from "@/hooks/use-auth";
import { useCreateProduct, useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema } from "@shared/routes";
import { Loader2, Plus, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Only minimal validation on client side, schema handles heavy lift
const formSchema = insertProductSchema;

export default function VendorDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  
  // In a real app we'd filter by vendor ID, here we just list all to show UI
  const { data: products, isLoading: productsLoading } = useProducts();
  const createProduct = useCreateProduct();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isAiCapable: false,
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        toast({ title: "Product created successfully" });
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Failed to create product", description: err.message, variant: "destructive" });
      }
    });
  };

  if (authLoading || productsLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-display font-bold">Vendor Dashboard</h1>
           <p className="text-muted-foreground">Manage your product listings</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>List New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input {...form.register("name")} placeholder="e.g. MedFlow AI" />
                  {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input {...form.register("slug")} placeholder="medflow-ai" />
                </div>
              </div>

              <div className="space-y-2">
                 <Label>Description</Label>
                 <Textarea {...form.register("description")} placeholder="Full product description..." />
                 {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Website URL</Label>
                   <Input {...form.register("websiteUrl")} placeholder="https://..." />
                 </div>
                 <div className="space-y-2">
                   <Label>Logo URL</Label>
                   <Input {...form.register("logoUrl")} placeholder="https://..." />
                 </div>
              </div>
              
              <div className="space-y-2">
                <Label>Pricing Tier</Label>
                <Input {...form.register("pricingTier")} placeholder="Freemium, Paid, etc." />
              </div>

              <Button type="submit" className="w-full" disabled={createProduct.isPending}>
                {createProduct.isPending ? "Creating..." : "Create Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {products?.map((product) => (
               <TableRow key={product.id}>
                 <TableCell className="font-medium flex items-center gap-3">
                   <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                     <Package className="w-4 h-4 text-muted-foreground" />
                   </div>
                   {product.name}
                 </TableCell>
                 <TableCell>Active</TableCell>
                 <TableCell>{product.rating ? (product.rating/10).toFixed(1) : "N/A"}</TableCell>
                 <TableCell className="text-right">
                   <Button variant="ghost" size="sm">Edit</Button>
                 </TableCell>
               </TableRow>
             ))}
             {products?.length === 0 && (
               <TableRow>
                 <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                   No products listed yet.
                 </TableCell>
               </TableRow>
             )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
