import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Briefcase,
  Search,
  CheckCircle2,
  ArrowRight,
  Database,
  Lock,
  Layers,
  Sparkles,
  BookOpen,
  TrendingUp,
  Cpu,
  HelpCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card, CardContent } from '@/components/common/Card';
import { useAuth } from '@/context/AuthContext';
import { ConfigBanner } from '@/components/common/ConfigBanner';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const workflowSteps = [
    {
      step: '01',
      title: 'Upload Your Resume',
      status: 'Ready in Stage 1',
      badgeVariant: 'emerald' as const,
      description:
        'Select or drag-and-drop your PDF resume. Client-side validation checks magic bytes and size constraints while keeping your data private.',
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
    },
    {
      step: '02',
      title: 'Select a Job Role',
      status: 'Ready in Stage 1',
      badgeVariant: 'emerald' as const,
      description:
        'Choose your target role from real Supabase database records, reviewing required competencies for backend, frontend, full-stack, data, and language paths.',
      icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
    },
    {
      step: '03',
      title: 'Understand Evidence & Matches',
      status: 'Stage 2 Analysis Engine',
      badgeVariant: 'indigo' as const,
      description:
        'The upcoming Python FastAPI engine uses PyMuPDF, spaCy, and semantic transformers to detect supporting project passages and classify evidence as strong, supported, limited, or missing.',
      icon: <Search className="w-5 h-5 text-indigo-600" />,
    },
    {
      step: '04',
      title: 'Build a Career Roadmap',
      status: 'Stage 3 Intelligence',
      badgeVariant: 'slate' as const,
      description:
        'Receive explainable gap breakdowns, tailored project recommendations, and curated roadmaps designed to help you strengthen missing competencies.',
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
    },
  ];

  const features = [
    {
      title: 'Evidence-Based Analysis',
      description:
        'Traditional resume scanners search for plain keywords. SkillSync detects whether a skill has real supporting evidence in projects, internships, or experience passages.',
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
    },
    {
      title: 'Four Evidence Levels',
      description:
        'Skills are classified systematically: Strong (demonstrated project impact), Supported (contextual mention), Limited (listed without proof), or Missing.',
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
    },
    {
      title: 'Transparent, Explainable Scoring',
      description:
        'No mysterious "72%" scores without context. SkillSync explains why your resume achieved its match rating and what specifically bridges the gap.',
      icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
    },
    {
      title: 'Privacy-First Architecture',
      description:
        'In Stage 1, resume files are validated locally and never permanently stored or shared with third-party LLMs. Your private documents stay under your control.',
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
    },
    {
      title: 'Direct Database Catalog',
      description:
        'Directly integrated with Supabase PostgreSQL. Job roles and required skill taxonomies are stored dynamically in relational database tables.',
      icon: <Database className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Extensible Multi-Stage Plan',
      description:
        'Engineered from day one with a clean boundary for the Stage 2 Python FastAPI analysis microservice and Stage 3 career intelligence engine.',
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ConfigBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-linear-to-b from-white via-slate-50/50 to-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Stage badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>Stage 1 Product Foundation Active</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-600 font-normal">Supabase Auth &amp; Database Connected</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Your Resume. Your Evidence.{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-teal-600">
                Your Next Opportunity.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Understand how your resume aligns with your target role, discover the skills you need to strengthen, and build a clearer path toward career readiness.
            </p>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Open Your Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/sign-up">
                    <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/sign-in">
                    <Button variant="outline" size="lg">
                      Sign In to Account
                    </Button>
                  </Link>
                </>
              )}
              <a href="#how-it-works">
                <Button variant="ghost" size="lg">
                  Explore How It Works
                </Button>
              </a>
            </div>

            {/* Evidence principle banner */}
            <div className="pt-8 max-w-xl mx-auto">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs text-xs text-slate-600 text-left flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-semibold mb-0.5">
                    Evidence Distinction Principle
                  </strong>
                  SkillSync evaluates what is explicitly written and substantiated in your resume. It distinguishes between documented evidence and unverified claims.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              The 4-Step Workflow
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              From Document Validation to Career Growth
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              A transparent system designed to give students and job seekers clear, actionable clarity at each step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((item) => (
              <Card key={item.step} className="flex flex-col h-full bg-slate-50/50 border-slate-200">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {item.step}
                    </span>
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.status}
                    </Badge>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-xs">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-base mb-2">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to={user ? '/dashboard/analyze' : '/sign-up'}>
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Try the Stage 1 Workflow Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Platform Features
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Engineered for Explainability &amp; Integrity
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              No black-box scores. No fake success metrics. A real engineering solution built on sound software principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h4 className="font-semibold text-slate-900 text-base mb-2">{feat.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Stage Roadmap Architecture Callout */}
      <section id="architecture" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Stage Development Roadmap</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Built to Scale Cleanly Across 4 Stages
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                SkillSync is developed systematically. Stage 1 establishes the verified product foundation, Supabase database integration, authentication, and PDF validation. The upcoming Stage 2 microservice will plug in directly without altering client schemas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-teal-500/40">
                  <div className="text-teal-400 font-bold text-xs uppercase mb-1">Stage 1 (Current)</div>
                  <div className="font-semibold text-white text-sm mb-1">Product Foundation</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    React + Vite frontend, Supabase Auth, PostgreSQL schema, role catalog &amp; PDF validation.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="text-indigo-400 font-bold text-xs uppercase mb-1">Stage 2 (Next)</div>
                  <div className="font-semibold text-white text-sm mb-1">Analysis Engine</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    FastAPI microservice, PyMuPDF text parsing, spaCy skill extraction &amp; evidence matching.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="text-amber-400 font-bold text-xs uppercase mb-1">Stage 3 (Future)</div>
                  <div className="font-semibold text-white text-sm mb-1">Career Intelligence</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Multi-role comparison, skill-gap analysis, and grounded learning roadmaps.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <div className="text-slate-400 font-bold text-xs uppercase mb-1">Stage 4 (Future)</div>
                  <div className="font-semibold text-white text-sm mb-1">Deploy &amp; Harden</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Production hardening, Vercel frontend, Render backend, end-to-end tests.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link to={user ? '/dashboard' : '/sign-up'}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    {user ? 'Enter Dashboard' : 'Explore SkillSync Today'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
