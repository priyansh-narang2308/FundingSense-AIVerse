import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  FileText,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../../contexts/LanguageContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: t("dashboard"), path: "/dashboard" },
    { icon: Search, label: t("analyze"), path: "/analyze" },
    { icon: MessageSquare, label: t("q_and_a"), path: "/chat" },
    { icon: FileText, label: t("evidence"), path: "/evidence" },
    { icon: Globe, label: t("language_settings"), path: "/settings/language" },
    { icon: Settings, label: t("settings"), path: "/settings" },
  ];

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/20 transition-colors duration-500">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed ? "w-24" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-24 flex items-center justify-between px-6 border-b border-border/10">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-display font-black text-foreground tracking-tighter"
              >
                Funding<span className="text-primary italic">Sense</span>
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex w-8 h-8 rounded-full border border-border/20 hover:bg-primary/5 hover:text-primary transition-all duration-300"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>


        <nav className="flex-1 py-10 px-4 space-y-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                )}
              >

                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-primary/10 border-l-[3px] border-primary rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-all duration-300 relative z-10",
                  isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110"
                )} />

                {!collapsed && (
                  <motion.span
                    className="relative z-10 tracking-tight text-sm uppercase font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.label}
                  </motion.span>
                )}

                {isActive && collapsed && (
                  <motion.div
                    layoutId="collapsed-active-bar"
                    className="absolute right-0 w-1.5 h-6 bg-primary rounded-l-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>


        <div className="p-6 border-t border-border/10 space-y-4">


          <div className="flex flex-col gap-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 group"
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              {!collapsed && <span className="font-bold text-xs uppercase tracking-widest">{t("toggle_theme")}</span>}
            </button>
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 group"
              )}
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
              {!collapsed && <span className="font-bold text-xs uppercase tracking-widest">{t("logout")}</span>}
            </button>
          </div>

          {!collapsed && (
            <div className="mt-4 px-4 hidden"> {/* Truly hidden but in DOM */}
              <div id="google_translate_element"></div>
            </div>
          )}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        <header className="lg:hidden h-20 border-b border-border/50 flex items-center justify-between px-6 bg-card/80 backdrop-blur-xl sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl bg-background border border-border/20 shadow-sm"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-foreground">
              Funding <span className="text-primary italic">Sense</span>
            </span>
          </Link>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-background border border-border/20 shadow-sm" onClick={toggleTheme}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </header>
        <main className="flex-1 p-6 lg:p-14 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px] -z-10 pointer-events-none" />
          <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[1500px] mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.08);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(var(--primary), 0.15);
        }
      `}</style>
    </div>
  );
}
