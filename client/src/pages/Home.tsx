import { Link } from "wouter";
import { Search, Sparkles, ArrowRight, Activity, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { motion } from "framer-motion";

export default function Home() {
  // Fetch trending products (sorted by rating for now)
  const { data: trendingProducts, isLoading } = useProducts({ sort: "rating" });

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute top-40 left-10 w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[80px]" />
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Healthcare Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground mb-6 leading-tight">
              Find the perfect <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">healthcare technology</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover, compare, and implement top-rated medical software. 
              Our AI assistant helps you navigate thousands of solutions to find your match.
            </p>

            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative flex gap-2 p-2 bg-background rounded-xl border border-border shadow-lg">
                <Input 
                  placeholder="Try 'AI tools for radiology' or 'Telehealth for small clinics'..." 
                  className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg h-12 bg-transparent"
                />
                <Link href="/directory">
                  <Button size="lg" className="px-8 h-12 rounded-lg text-base font-semibold shadow-md shadow-primary/25">
                    Search
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Verified Reviews</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Live Market Data</span>
              <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Deep Comparisons</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Trending Solutions</h2>
            <p className="text-muted-foreground mt-1">Most popular products this week</p>
          </div>
          <Link href="/directory" className="text-primary font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid (Mocked data for visuals) */}
      <section className="bg-secondary/30 py-20 border-y border-border/50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl font-display font-bold text-center mb-12">Explore by Category</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {["EHR / EMR", "Telehealth", "Revenue Cycle", "Patient Engagement", "Medical Imaging", "AI Diagnostics"].map((cat) => (
               <Link key={cat} href={`/directory?search=${cat}`}>
                 <div className="bg-card hover:bg-white p-6 rounded-xl border border-border text-center hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                   <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                     <Activity className="w-5 h-5" />
                   </div>
                   <span className="font-medium text-sm">{cat}</span>
                 </div>
               </Link>
             ))}
           </div>
        </div>
      </section>

      {/* AI Assistant CTA */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80')] bg-cover opacity-10 mix-blend-overlay" />
          
          <div className="relative z-10 max-w-2xl text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-6 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Feature</span>
            </div>
            <h2 className="text-4xl font-display font-bold mb-6">Unsure what you need? Ask Medigy AI.</h2>
            <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
              Describe your practice's needs, budget, and pain points. Our AI consultant will analyze thousands of products to recommend the best fit for you.
            </p>
            <Link href="/ai-assistant">
              <Button size="lg" variant="secondary" className="font-semibold text-primary h-12 px-8">
                Start Chatting
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
