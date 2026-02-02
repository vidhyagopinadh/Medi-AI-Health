import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search, 
  Menu, 
  X, 
  UserCircle, 
  LogOut, 
  LayoutDashboard,
  MessageSquarePlus,
  Scale
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/directory", label: "Directory" },
    { href: "/compare", label: "Compare" },
    { href: "/ai-assistant", label: "AI Assistant" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xl font-display">
                  M
                </div>
                <span className="text-xl font-bold font-display tracking-tight">Medigy</span>
              </Link>
              
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location === link.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/directory">
                <Button variant="ghost" size="icon">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </Button>
              </Link>
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt={user.firstName || "User"} 
                          className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <UserCircle className="w-8 h-8 text-muted-foreground" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Vendor Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/ai-assistant" className="cursor-pointer">
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        <span>My Chats</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a href="/api/login">
                  <Button size="sm" className="font-semibold px-6 shadow-md shadow-primary/20">
                    Sign In
                  </Button>
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 space-y-4 animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="block text-base font-medium text-foreground hover:text-primary py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    {user?.profileImageUrl && (
                      <img src={user.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-full" />
                    )}
                    <span className="font-medium">{user?.firstName}</span>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start mb-2">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                  </Link>
                  <Button variant="destructive" className="w-full justify-start" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </Button>
                </>
              ) : (
                <a href="/api/login" className="block">
                  <Button className="w-full">Sign In</Button>
                </a>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold font-display">
                M
              </div>
              <span className="text-lg font-bold font-display">Medigy</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The intelligent marketplace for healthcare technology. Discover, compare, and implement the best solutions for your organization.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/directory" className="hover:text-primary">Browse Products</Link></li>
              <li><Link href="/compare" className="hover:text-primary">Comparison Tool</Link></li>
              <li><Link href="/ai-assistant" className="hover:text-primary">AI Assistant</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">For Vendors</a></li>
              <li><a href="#" className="hover:text-primary">Write a Review</a></li>
              <li><a href="#" className="hover:text-primary">Help Center</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Medigy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
