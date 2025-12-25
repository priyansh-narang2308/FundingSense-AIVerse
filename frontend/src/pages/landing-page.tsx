/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  CheckCircle,
  Globe,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  LogOut,
  Settings as SettingsIcon,
  Star,
  Layers,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { getStats } from "../services/api";
import { supabase } from "../utils/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { motion, useScroll, useTransform } from "motion/react";

const features = [
  {
    icon: CheckCircle,
    title: "Evidence-Backed Decisions",
    description:
      "Every recommendation is backed by real funding data, policy documents, and market intelligence.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Full support for Indic languages, making funding intelligence accessible to founders across India.",
  },
  {
    icon: Lightbulb,
    title: "Explainable AI Insights",
    description:
      "Understand exactly why a funding outcome is predicted. No black boxes, complete transparency.",
  },
];

const benefits = [
  {
    icon: BarChart3,
    title: "Investor Matching",
    description:
      "Find investors whose portfolio and thesis align with your startup.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Understand potential rejection reasons before you pitch.",
  },
  {
    icon: Zap,
    title: "Fast Insights",
    description: "Get actionable funding intelligence in minutes, not weeks.",
  },
];

const GridBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div 
      className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" 
    />
    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    total_analyses: "1,240+",
    total_investors: "850+",
    avg_score: "82%",
  });

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    getStats()
      .then((data) => {
        if (data.total_analyses > 0) {
          setStats({
            total_analyses: data.total_analyses.toLocaleString() + "+",
            total_investors: data.total_investors.toString() + "+",
            avg_score: data.avg_score,
          });
        }
      })
      .catch(() => console.log("Stats fetch failed, using defaults"));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <GridBackground />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <span className="text-2xl font-display font-bold text-foreground tracking-tight">
              Funding<span className="text-primary">Sense</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="hidden sm:block">
                  <Button variant="ghost" className="hover:bg-primary/5">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full border border-border/50 hover:bg-muted p-0 overflow-hidden"
                    >
                      <Avatar className="h-full w-full">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url}
                          alt={user.email}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-display">
                          {user.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Account</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="hover:bg-primary/5">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-full px-6">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              style={{ opacity, scale }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                V2.0 Now Live
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-[1.1] text-balance">
                The Next Gen of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
                  Funding Intelligence
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Unlock deep, evidence-backed AI insights derived from millions of 
                real-world funding data points. Stop guessing. Start closing.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link to={user ? "/analyze" : "/signup"}>
                  <Button size="xl" className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 group px-8">
                    Analyze Your Funding Fit
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
           
              </div>
              
      
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 animate-pulse" />
              <div className="relative z-10 w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary/20">
                <img 
                  src="/funding_hero.png" 
                  alt="Funding Insight Abstract" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-x-4 bottom-4 glass rounded-2xl p-6 border border-white/20 shadow-xl backdrop-blur-md">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <Layers className="w-4 h-4 text-primary" />
                        Live Analysis
                      </div>
                      <div className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                        94% ACCURACY
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                         <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 2, delay: 1 }}
                          className="h-full bg-primary" 
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-medium opacity-70 uppercase tracking-widest">
                        <span>Data Scraped</span>
                        <span>Processed</span>
                      </div>
                   </div>
                </div>
              </div>
              
            
             
            </motion.div>
          </div>
        </div>
      </section>

 


      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Everything You Need to Scale
            </h3>
            <p className="text-muted-foreground text-lg">
              We leverage advanced RAG architectures and deep market intelligence 
              to give you the edge in every pitch meeting.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
            
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 px-6 bg-muted/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">The Process</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold">Three Steps to Funding Clarity</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
             {/* Connection Line */}
            <div className="absolute top-[40px] left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent hidden md:block" />
            
            {[
              { 
                step: "01", 
                title: "Data Ingestion", 
                desc: "Securely upload your pitch deck or sync your startup profile.",
                icon: Layers
              },
              { 
                step: "02", 
                title: "AI Analysis", 
                desc: "Our models compare your data against millions of funding events.",
                icon: Zap
              },
              { 
                step: "03", 
                title: "Match & Close", 
                desc: "Receive actionable insights and matched investor lists.",
                icon: Star
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 text-center space-y-6 group"
              >
                <div className="w-20 h-20 rounded-2xl bg-background border border-border shadow-xl mx-auto flex items-center justify-center text-2xl font-black text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:rotate-6">
                   <item.icon className="w-8 h-8" />
                </div>
                <div>
                   <div className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Step {item.step}</div>
                   <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                   <p className="text-muted-foreground leading-relaxed px-4">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-foreground text-background overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <GridBackground />
        </div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
                Stop Sending Cold Emails. <br />
                <span className="text-primary">Start Building Relationships.</span>
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <benefit.icon className="w-6 h-6 text-primary group-hover:text-background" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{benefit.title}</h4>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/30 blur-[80px] rounded-full opacity-50" />
              <div className="relative bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-lg">Predictive Score v2</h5>
                      <p className="text-zinc-500 text-sm">Target Analysis: Vertex Ventures</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-zinc-400">Match Probability</span>
                       <span className="text-emerald-400 font-bold">92%</span>
                    </div>
                    <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "92%" }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                        />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                       {[
                         { label: "Thesis Fit", val: "High" },
                         { label: "Check Size", val: "Optimal" },
                         { label: "Portfolio", val: "Unique" },
                       ].map((item, i) => (
                         <div key={i} className="bg-zinc-800/50 p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-[10px] text-zinc-500 uppercase mb-1 font-bold">{item.label}</div>
                            <div className="text-xs font-bold text-white">{item.val}</div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[40px] bg-gradient-to-br from-primary to-emerald-700 p-12 md:p-20 text-center text-primary-foreground shadow-2xl shadow-primary/40 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            
            <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                Ready to understand your <br className="hidden md:block" />
                <span className="underline decoration-white/30 underline-offset-8">funding landscape?</span>
              </h2>
          
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                <Link to={user ? "/analyze" : "/signup"}>
                  <Button size="xl" className="w-full sm:w-auto bg-white text-primary hover:bg-zinc-100 rounded-full px-12 font-bold shadow-xl group">
                    Start Free Analysis
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-20 px-6 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-display font-bold text-foreground">
                  FundingSense
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm">
                The world's most advanced funding intelligence platform powered by 
                explainable AI and deep market data.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-foreground uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary">Features</Link></li>
                <li><Link to="/investors" className="hover:text-primary">Investors</Link></li>
                <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-foreground uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary">About</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-border/50 gap-6">
            <p className="text-sm text-muted-foreground">
              © 2025 FundingSense AI. Built for the next generation of founders.
            </p>
            <div className="flex items-center gap-6">
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .dark .glass {
          background: rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </div>
  );
}

function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
