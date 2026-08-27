import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Building2, GraduationCap, Users } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Navbar } from "@/components/khoranex/Navbar";
import { Footer } from "@/components/khoranex/Footer";
import { Reveal } from "@/components/khoranex/Reveal";
import { StatCounter } from "@/components/khoranex/StatCounter";
import { PillarCard } from "@/components/khoranex/PillarCard";
import { TestimonialCard, type Testimonial } from "@/components/khoranex/TestimonialCard";
import { LogoMarquee, LogoMark } from "@/components/khoranex/LogoStrip";
import { HeroGraphic } from "@/components/khoranex/HeroGraphic";

const TITLE = "Khoranex — Where Talent Meets Opportunity";
const DESCRIPTION =
  "Khoranex is the campus placement platform connecting colleges, employers and students — automate placements, hire young talent faster, and land your first job.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const pillars = [
  {
    icon: Building2,
    eyebrow: "Employers",
    title: "End-to-end virtual campus hiring",
    description:
      "Run your entire campus season from one place — from first outreach to final offer rollout.",
    features: [
      "Targeted outreach across 600+ campuses",
      "Branded engagement and pre-placement talks",
      "Assessments and live virtual interviews",
      "Real-time funnel and offer analytics",
    ],
    cta: "For Employers",
    id: "employers",
  },
  {
    icon: GraduationCap,
    eyebrow: "Universities",
    title: "Digitise & automate placements online",
    description:
      "Replace spreadsheets and WhatsApp groups with a single system of record for your placement cell.",
    features: [
      "Verified student profiles and eligibility rules",
      "Job postings with automated shortlisting",
      "Conflict-free interview scheduling",
      "Placement reports ready for accreditation",
    ],
    cta: "For Universities",
    id: "universities",
  },
  {
    icon: Users,
    eyebrow: "Students",
    title: "Learn, prepare & apply to jobs",
    description:
      "Discover every opportunity you are eligible for, and walk into interviews genuinely prepared.",
    features: [
      "One profile for every campus application",
      "Role-wise interview and aptitude prep",
      "Job-oriented courses and mock tests",
      "Transparent application status tracking",
    ],
    cta: "For Students",
    id: "students",
  },
];

const institutions = [
  "Northfield Institute of Technology",
  "Sriram College of Engineering",
  "Meridian Business School",
  "Grantham University",
  "Ashwood Institute of Management",
  "Verdant Valley University",
  "Kingsley Polytechnic",
  "Harbour City College",
];

const press = ["The Daily Ledger", "Tech Chronicle", "Business Standard Weekly", "EdTech Review", "Founders Digest"];

const testimonials: Testimonial[] = [
  {
    quote:
      "Our placement season used to run on spreadsheets and late-night phone calls. With Khoranex, scheduling 4,000 interviews took an afternoon.",
    name: "Dr. Ananya Rao",
    title: "Head of Training & Placements",
    institution: "Northfield Institute of Technology",
    initials: "AR",
  },
  {
    quote:
      "Recruiters notice the difference immediately. Verified profiles, clean eligibility filters, and zero back-and-forth on shortlists.",
    name: "Vikram Shetty",
    title: "Placement Officer",
    institution: "Sriram College of Engineering",
    initials: "VS",
  },
  {
    quote:
      "The analytics finally gave our leadership a real picture of placement outcomes, branch by branch, in a format accreditation bodies accept.",
    name: "Prof. Meera Iyer",
    title: "Dean, Career Services",
    institution: "Meridian Business School",
    initials: "MI",
  },
  {
    quote:
      "We onboarded 180 recruiters in a single season. Khoranex handled the volume without a single scheduling clash.",
    name: "Rahul Menon",
    title: "Director of Corporate Relations",
    institution: "Grantham University",
    initials: "RM",
  },
  {
    quote:
      "Students no longer miss deadlines. Everything they need — openings, prep, status — lives in one place they actually check.",
    name: "Sneha Kulkarni",
    title: "Associate Dean of Placements",
    institution: "Ashwood Institute of Management",
    initials: "SK",
  },
];

function Index() {
  return (
    <div id="top" className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-gradient-brand opacity-10 blur-3xl"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 lg:grid-cols-2 lg:py-28">
            <Reveal>
              <span className="inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary-foreground">
                Campus hiring, reimagined
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Where Talent Meets <span className="text-gradient-brand">Opportunity</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Khoranex helps students get their first jobs, enables employers to recruit
                faster, and helps colleges streamline campus placements.
              </p>
              <div className="mt-9">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-4 text-base font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <HeroGraphic />
            </Reveal>
          </div>

          <div className="mx-auto max-w-7xl px-5 pb-20">
            <Reveal>
              <div className="grid gap-10 rounded-3xl border border-border bg-surface-tint px-8 py-12 sm:grid-cols-3">
                <StatCounter value={2700000} label="Students" />
                <StatCounter value={600} label="Colleges" />
                <StatCounter value={12800} label="Employers" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-7xl px-5 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              One platform, three sides of campus hiring
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Purpose-built workflows for everyone involved in placements.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.id} id={p.id} className="scroll-mt-28">
                <Reveal delay={i * 110} className="h-full">
                  <PillarCard {...p} />
                </Reveal>
              </div>
            ))}
          </div>
        </section>

        {/* Trusted by */}
        <section className="border-y border-border bg-surface-tint py-16">
          <Reveal>
            <h2 className="px-5 text-center text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Trusted by leading institutions
            </h2>
            <div className="mt-10 hidden md:block">
              <LogoMarquee items={institutions} />
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 px-5 sm:grid-cols-2 md:hidden">
              {institutions.slice(0, 6).map((name) => (
                <LogoMark key={name} name={name} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-7xl px-5 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Why colleges love Khoranex
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Placement teams across the country run their season on Khoranex.
            </p>
          </Reveal>

          <Reveal className="mt-14">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-6">
                {testimonials.map((t) => (
                  <CarouselItem key={t.name} className="pl-6 md:basis-1/2 lg:basis-1/3">
                    <TestimonialCard t={t} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-10 flex justify-center gap-3">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </Reveal>
        </section>

        {/* In the news */}
        <section id="news" className="border-t border-border bg-surface-tint py-16 scroll-mt-24">
          <Reveal className="mx-auto max-w-7xl px-5">
            <h2 className="text-center text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
              In the news
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 opacity-70">
              {press.map((name) => (
                <LogoMark key={name} name={name} />
              ))}
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
