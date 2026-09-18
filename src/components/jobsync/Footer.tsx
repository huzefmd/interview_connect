import { Linkedin, Twitter, Facebook, Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Universities",
    links: ["Placement automation", "Student database", "Interview scheduling", "Placement analytics", "Request a demo"],
  },
  {
    title: "Employers",
    links: ["Campus outreach", "Assessments", "Virtual interviews", "Hiring analytics", "Talk to sales"],
  },
  {
    title: "Students",
    links: ["Find jobs & internships", "Interview preparation", "Resume builder", "Career resources", "Student login"],
  },
  {
    title: "Resources",
    links: ["Job-oriented courses", "Placement handbook", "Webinars", "Blog", "Help centre"],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-surface-tint">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)_1.2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              JobSync enables colleges to automate end-to-end campus placements, helps
              employers hire young talent, and empowers students to access opportunities
              democratically.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Facebook, label: "Facebook" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#contact"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#contact"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
              Contact Sales
            </h3>
            <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href="tel:+911800000000" className="hover:text-primary">+91 1800 000 000</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <a href="mailto:sales@khoranex.com" className="break-all hover:text-primary">
                  sales@khoranex.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>4th Floor, Tech Park One, Bengaluru, Karnataka 560103</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © 2025-26 JobSync. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#contact" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
