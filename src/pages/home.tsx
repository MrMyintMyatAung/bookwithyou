import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePublicSessions } from "../hooks/useSessions";
import { Button } from "../components/ui/button";
import { Avatar } from "../components/ui/avatar";
import { ProgressBar } from "../components/sessions/progress-bar";
import { SessionCard, SessionCardSkeleton } from "../components/sessions/session-card";
import { DashboardMeshBg } from "../components/ui/dashboard-mesh-bg";

/* ─── Scroll reveal ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Static data ─── */

const DEMO_MEMBERS = [
  { username: "alex_reads", chapters: 12, total: 15 },
  { username: "jordan_books", chapters: 8, total: 15 },
  { username: "sam_pages", chapters: 3, total: 15 },
];

const TESTIMONIALS = [
  {
    quote: "BooksWithYou made our book club so much more organized. Tracking progress chapter by chapter keeps everyone accountable.",
    name: "Sarah M.",
    role: "Book club organizer",
  },
  {
    quote: "I love seeing what my friends are reading and how far they've gotten. The emoji reactions make discussions so fun!",
    name: "James K.",
    role: "Avid reader",
  },
  {
    quote: "Finally, a reading tracker that's social without being distracting. The chapter-by-chapter approach is exactly what I needed.",
    name: "Priya R.",
    role: "Literature student",
  },
];

/* ─── Sub-components ─── */

function RecentSessions() {
  const { data: sessions, isLoading } = usePublicSessions();

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SessionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.slice(0, 3).map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

/* ─── Page ─── */

export function HomePage() {
  const { isAuthenticated, profile } = useAuth();
  const revealRefs = Array.from({ length: 8 }, () => useReveal());

  return (
    <div className="relative">
      {/* Mesh gradient background */}
      <DashboardMeshBg />

      {/* ──────────────────────── Hero ──────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column */}
            <div>
              {/* Badge */}
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm font-semibold text-primary-700 dark:text-primary-400"
                style={{ opacity: 0, animation: "fadeSlideDown 0.6s cubic-bezier(0.16,1,0.3,1) 0ms forwards" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                Read together, stay motivated
              </div>

              {/* Heading */}
              <h1
                className="text-4xl font-black leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
                style={{ opacity: 0, animation: "fadeScaleUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards" }}
              >
                Track books{" "}
                <span className="text-primary-600">together</span>
              </h1>

              {/* Subtitle */}
              <p
                className="mt-4 text-lg text-slate-500 dark:text-white/60 max-w-lg"
                style={{ opacity: 0, animation: "fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s forwards" }}
              >
                Create reading sessions, log your progress chapter by chapter, and discuss your favorite books with your community.
              </p>

              {/* CTAs */}
              <div
                className="mt-8 flex flex-col sm:flex-row items-start gap-3"
                style={{ opacity: 0, animation: "fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.45s forwards" }}
              >
                {isAuthenticated ? (
                  <>
                    <Link to="/sessions/new" className="no-underline">
                      <Button variant="brand" size="lg">
                        Start a Reading Session →
                      </Button>
                    </Link>
                    <Link to="/sessions" className="no-underline">
                      <Button variant="secondary" size="lg">
                        Browse Sessions
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="no-underline">
                      <Button variant="brand" size="lg">
                        Get Started →
                      </Button>
                    </Link>
                    <Link to="/sessions" className="no-underline">
                      <Button variant="secondary" size="lg">
                        Browse Sessions
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right column — book illustration placeholder */}
            <div
              className="hidden lg:flex items-center justify-center"
              style={{ opacity: 0, animation: "fadeScaleUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s forwards" }}
              aria-hidden="true"
            >
              <div className="relative">
                <div className="bg-primary-500/10 ring-1 ring-primary-500/20 w-64 h-80 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <div className="text-center">
                    <svg className="h-24 w-24 text-primary-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="mt-3 text-sm font-bold text-primary-500">BooksWithYou</p>
                  </div>
                </div>
                {/* Floating mini cards */}
                <div className="absolute -top-4 -right-4 bg-teal-500/10 ring-1 ring-teal-500/20 rounded-xl p-3 shadow-md" style={{ animation: "auroraDrift 8s ease-in-out infinite" }}>
                  <svg className="h-6 w-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-3 -left-3 bg-primary-500/10 ring-1 ring-primary-500/20 rounded-xl p-3 shadow-md" style={{ animation: "auroraDrift 10s ease-in-out infinite reverse" }}>
                  <svg className="h-6 w-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── How It Works ──────────────────────── */}
      <section className="reveal py-16 sm:py-20" ref={revealRefs[0]}>
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <span className="section-label text-primary-500">How It Works</span>
          <h2 className="mt-2 text-center text-3xl font-extrabold sm:text-4xl text-slate-900 dark:text-white">
            Read together, not alone
          </h2>
          <p className="mt-3 text-center text-slate-400 dark:text-white/50 max-w-xl mx-auto">
            Three simple steps to start your reading journey with friends.
          </p>

          <div className="mt-12 grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Pick a Book",
                desc: "Create a reading session with any book. Add the title, author, and chapter list.",
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                ),
              },
              {
                step: "2",
                title: "Invite Readers",
                desc: "Share your session link. Anyone can join and read along at their own pace.",
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ),
              },
              {
                step: "3",
                title: "Log Progress",
                desc: "Update your chapter count as you read. See progress bars for every member.",
                icon: (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/10 ring-1 ring-teal-500/20 text-teal-400 text-xl font-extrabold mb-4">
                  {item.step}
                </div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500/10 ring-1 ring-primary-500/20 text-primary-500 mb-3">
                  <span className="w-5 h-5">{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400 dark:text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Features ──────────────────────── */}
      <section className="reveal py-16 sm:py-20" ref={revealRefs[1]}>
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <span className="section-label text-primary-500">Features</span>
          <h2 className="mt-2 text-center text-3xl font-extrabold sm:text-4xl text-slate-900 dark:text-white">
            Everything you need
          </h2>
          <p className="mt-3 text-center text-slate-400 dark:text-white/50 max-w-xl mx-auto">
            Tools designed to make group reading simple and fun.
          </p>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Public & Private", desc: "Open sessions for all to join, or keep them invite-only.", bg: "bg-white dark:bg-white/[0.04]", iconColor: "text-primary-700 dark:text-primary-400", iconBg: "bg-primary-500/10" },
              { title: "Chapter Tracking", desc: "Break books into chapters and track progress precisely.", bg: "bg-teal-50 dark:bg-teal-500/[0.06]", iconColor: "text-teal-600 dark:text-teal-400", iconBg: "bg-teal-500/10" },
              { title: "Live Discussions", desc: "Chat in real time with fellow readers in the session.", bg: "bg-primary-50 dark:bg-primary-500/[0.06]", iconColor: "text-primary-700 dark:text-primary-400", iconBg: "bg-primary-500/10" },
              { title: "Emoji Reactions", desc: "React to comments with emojis. Simple and expressive.", bg: "bg-primary-50 dark:bg-primary-500/[0.06]", iconColor: "text-primary-700 dark:text-primary-400", iconBg: "bg-primary-500/10" },
            ].map((f, i) => (
              <div key={i} className={`${f.bg} rounded-2xl border border-neutral-200 dark:border-white/[0.06] p-6 hover:shadow-md transition-shadow backdrop-blur-sm`}>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${f.iconBg} ${f.iconColor} mb-4`}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-400 dark:text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Live Sessions ──────────────────────── */}
      <section className="reveal py-16 sm:py-20" ref={revealRefs[3]}>
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <span className="section-label text-primary-500">Live Sessions</span>
          <div className="flex items-end justify-between">
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl text-slate-900 dark:text-white">
              Join a reading session
            </h2>
          </div>
          <p className="mt-2 text-slate-400 dark:text-white/50 mb-8">
            Browse public sessions and start tracking progress with fellow readers.
          </p>
          <RecentSessions />
          <div className="mt-8 text-center">
            <Link to="/sessions" className="no-underline">
              <Button variant="brand-outline">View all sessions →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────── Progress Demo ──────────────────────── */}
      <section className="reveal py-16 sm:py-20" ref={revealRefs[4]}>
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <span className="section-label text-primary-500">Track Together</span>
          <h2 className="mt-2 text-center text-3xl font-extrabold sm:text-4xl text-slate-900 dark:text-white">
            See everyone&apos;s progress in real time
          </h2>
          <p className="mt-3 text-center text-slate-400 dark:text-white/50 max-w-xl mx-auto mb-10">
            Each member logs their chapters as they read. Progress updates instantly.
          </p>

          <div className="max-w-2xl mx-auto bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-8 backdrop-blur-sm">
            <div className="mb-6 pb-5 border-b border-slate-200 dark:border-white/[0.06]">
              <p className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-1">Currently reading</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Hail Mary</h3>
              <p className="text-sm text-slate-500 dark:text-white/50">by Andy Weir</p>
            </div>

            <div className="space-y-5">
              {DEMO_MEMBERS.map((m, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar avatarUrl={null} username={m.username} size="sm" />
                    <span className="text-sm font-medium text-slate-700 dark:text-white/80">{m.username}</span>
                    <span className="ml-auto text-xs text-slate-400 dark:text-white/40">{m.chapters} / {m.total} chapters</span>
                  </div>
                  <ProgressBar chaptersCompleted={m.chapters} totalChapters={m.total} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── Testimonials ──────────────────────── */}
      <section className="reveal py-16 sm:py-20" ref={revealRefs[5]}>
        <div className="mx-auto max-w-5xl px-5 sm:px-6">
          <span className="section-label text-primary-500">Testimonials</span>
          <h2 className="mt-2 text-center text-3xl font-extrabold sm:text-4xl text-slate-900 dark:text-white">
            Loved by readers
          </h2>
          <p className="mt-3 text-center text-slate-400 dark:text-white/50 max-w-xl mx-auto mb-10">
            Join a growing community of readers who track books together.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <blockquote key={i} className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                <svg className="h-8 w-8 text-primary-600/30 mb-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-white/70 font-serif italic">{t.quote}</p>
                <footer className="mt-4 flex items-center gap-3">
                  <Avatar avatarUrl={null} username={t.name} size="sm" />
                  <div>
                    <cite className="not-italic text-sm font-semibold text-slate-900 dark:text-white">{t.name}</cite>
                    <p className="text-xs text-slate-400 dark:text-white/40">{t.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Final CTA ──────────────────────── */}
      <section className="reveal" ref={revealRefs[6]}>
        <div className="bg-white/60 dark:bg-white/[0.03] py-16 sm:py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 text-center">
            {isAuthenticated ? (
              <>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                  Welcome back, <span className="text-primary-700 dark:text-primary-400">{profile?.username ?? "Reader"}</span>
                </h2>
                <p className="mt-4 text-slate-400 dark:text-white/50 max-w-md mx-auto">
                  Continue where you left off or start something new.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/sessions/new" className="no-underline">
                    <Button variant="primary" size="lg">
                      Start a Session →
                    </Button>
                  </Link>
                  <Link to="/sessions" className="no-underline">
                    <Button variant="brand-outline" size="lg" className="!border-slate-300 dark:!border-white/20 !text-slate-600 dark:!text-white/70 hover:!bg-slate-100 dark:hover:!bg-white/10">
                      Browse Sessions
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                  Ready to start reading together?
                </h2>
                <p className="mt-4 text-slate-400 dark:text-white/50 max-w-md mx-auto">
                  Join BooksWithYou and track books with your community — chapter by chapter.
                </p>
                <div className="mt-8">
                  <Link to="/register" className="no-underline">
                    <Button variant="primary" size="lg">
                      Get Started Free →
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Extra Space ──────────────────────── */}
      <div className="h-8" ref={revealRefs[7]} />
    </div>
  );
}
