import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Signup from "@/pages/signup";
import Admin from "@/pages/admin";
import Login from "@/pages/admin/login";
import Success from "@/pages/success";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Signup} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/login" component={Login} />
      <Route path="/success" component={Success} />
      <Route component={NotFound} />
    </Switch>
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
