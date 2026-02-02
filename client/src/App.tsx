import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";

import Home from "@/pages/Home";
import Directory from "@/pages/Directory";
import ProductDetail from "@/pages/ProductDetail";
import AIAssistant from "@/pages/AIAssistant";
import VendorDashboard from "@/pages/VendorDashboard";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    // Redirect handled by logic or show login prompt
    window.location.href = "/api/login";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/directory" component={Directory} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/ai-assistant">
           <ProtectedRoute component={AIAssistant} />
        </Route>
        <Route path="/dashboard">
           <ProtectedRoute component={VendorDashboard} />
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
