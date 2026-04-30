import Link from "next/link";
import { apiService } from "../../services/api.service";
import { Button } from "@/components/ui/button";

const firstImageUrl = (images) => {
  const list = Array.isArray(images) ? images : [];
  return list[0]?.url || null;
};

const pickImages = (about) => {
  const urls = [
    about?.heroImage?.url,
    ...(about?.bannerImages || []).map((i) => i?.url),
    ...(about?.galleryImages || []).map((i) => i?.url),
    ...(about?.storyImages || []).map((i) => i?.url),
  ].filter(Boolean);
  return Array.from(new Set(urls)).slice(0, 3);
};

export async function generateMetadata() {
  const about = await apiService.getAboutUs();
  if (!about) {
    return {
      title: "About Us | GoldenHive",
      robots: { index: false, follow: false },
    };
  }

  const title = about.heroTitle ? `${about.heroTitle} | GoldenHive` : "About Us | GoldenHive";
  const description =
    about.heroSubtitle ||
    about.missionStatement ||
    "Learn more about GoldenHive and our travel philosophy.";
  const images = pickImages(about);

  return {
    title,
    description,
    alternates: { canonical: "/about-us" },
    openGraph: {
      title,
      description,
      type: "website",
      url: "/about-us",
      siteName: "GoldenHive",
      images: images.map((url) => ({ url })),
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
  };
}

export default async function AboutUsPage() {
  const [about, categories, footer] = await Promise.all([
    apiService.getAboutUs(),
    apiService.getCategories(),
    apiService.getFooter({ isActive: true }),
  ]);

  const activeCategories = (categories || []).filter((category) => category?.isActive !== false);

  if (!about) {
    return (
      <main>
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
          <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-8 py-12 shadow-[0_18px_45px_rgba(121,68,44,0.12)]">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">About Us</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--gh-heading)]">GoldenHive Holidays</h1>
            <p className="mt-3 max-w-xl text-sm font-semibold text-[color:var(--gh-text-soft)]">
              Content is not available right now. Please try again later.
            </p>
            <Button asChild variant="brand" className="mt-7 rounded-2xl px-6 py-4 text-sm font-black">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const visibility = about.visibility || {};
  const show = {
    hero: visibility.heroSection !== false,
    banners: visibility.bannerSection !== false && (about.bannerImages || []).length > 0,
    missionVision: visibility.missionVision !== false,
    coreValues: visibility.coreValues !== false && (about.coreValues || []).length > 0,
    ourStory: visibility.ourStory !== false && (about.ourStoryHeading || about.ourStoryContent),
    gallery: visibility.gallery !== false && (about.galleryImages || []).length > 0,
    stats: visibility.stats !== false && (about.stats || []).length > 0,
    leadership: visibility.leadershipTeam !== false && (about.leadershipTeam || []).length > 0,
  };

  return (
    <main>
        {show.hero && (
          <section className="relative overflow-hidden bg-slate-950">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${about.heroImage?.url || ""})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

            <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-24">
              <div className="max-w-3xl text-white">
                <p className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wider backdrop-blur">
                  About GoldenHive
                </p>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  {about.heroTitle}
                </h1>
                <p className="mt-4 text-base font-medium text-white/85 sm:text-lg">
                  {about.heroSubtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild variant="brand" className="rounded-2xl px-6 py-4 text-sm font-black">
                    <Link href="#mission">Our mission</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-2xl border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white hover:bg-white/15">
                    <Link href="/tour-packages">Explore packages</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-5 sm:py-12">
          {show.banners && (
            <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-[color:var(--gh-heading)]">Moments</h2>
                <p className="text-sm font-semibold text-[color:var(--gh-text-soft)]">A peek into the experience</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {about.bannerImages.map((img, idx) => (
                  <div
                    key={img.url || idx}
                    className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${img.url})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-sm font-black text-white">{img.caption || img.altText || "GoldenHive"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {show.missionVision && (
            <section id="mission" className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-7 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">Mission</div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-[color:var(--gh-heading)]">What we promise</h2>
                <p className="mt-4 text-[15px] font-medium leading-7 text-[color:var(--gh-text-soft)]">
                  {about.missionStatement}
                </p>
              </div>
              <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-7 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">Vision</div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-[color:var(--gh-heading)]">Where we are headed</h2>
                <p className="mt-4 text-[15px] font-medium leading-7 text-[color:var(--gh-text-soft)]">
                  {about.visionStatement}
                </p>
              </div>
            </section>
          )}

          {show.coreValues && (
            <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">Core values</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[color:var(--gh-heading)]">How we work</h2>
                </div>
                <p className="text-sm font-semibold text-[color:var(--gh-text-soft)]">Principles that guide every trip</p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {about.coreValues.map((value, idx) => (
                  <div
                    key={`${value.title}-${idx}`}
                    className="group rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] p-5 transition hover:bg-[rgba(255,253,249,0.98)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[rgba(255,253,249,0.96)] shadow-[0_4px_12px_rgba(121,68,44,0.10)]">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${value.iconImage?.url || ""})` }}
                        />
                      </div>
                      <div className="text-base font-black text-[color:var(--gh-heading)]">{value.title}</div>
                    </div>
                    <p className="mt-4 text-sm font-medium leading-7 text-[color:var(--gh-text-soft)]">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {show.ourStory && (
            <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">Our story</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[color:var(--gh-heading)]">
                    {about.ourStoryHeading || "Our story"}
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-[15px] font-medium leading-7 text-[color:var(--gh-text-soft)]">
                    {about.ourStoryContent}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {(about.storyImages || []).map((img, idx) => (
                    <div
                      key={img.url || idx}
                      className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)]"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url(${img.url})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-sm font-black text-white">
                        {img.caption || img.altText || "GoldenHive"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {show.gallery && (
            <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-[color:var(--gh-heading)]">Gallery</h2>
                <p className="text-sm font-semibold text-[color:var(--gh-text-soft)]">Memories we build together</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {about.galleryImages.map((img, idx) => (
                  <div
                    key={img.url || idx}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${img.url})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 right-4 text-sm font-black text-white/95 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {img.caption || img.altText || "GoldenHive"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {show.stats && (
            <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">By the numbers</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[color:var(--gh-heading)]">Impact</h2>
                </div>
                <p className="text-sm font-semibold text-[color:var(--gh-text-soft)]">Growing with every journey</p>
              </div>
              <div className="mt-7 grid gap-4 grid-cols-2 sm:grid-cols-3">
                {about.stats.map((stat, idx) => (
                  <div
                    key={`${stat.label}-${idx}`}
                    className="rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)] p-5"
                  >
                    <div className="text-3xl font-black tracking-tight text-[color:var(--gh-accent)]">{stat.value}</div>
                    <div className="mt-1 text-sm font-semibold text-[color:var(--gh-heading)]">{stat.label}</div>
                    <div className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--gh-text-soft)]">
                      {stat.icon || "stat"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {show.leadership && (
            <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">Leadership</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[color:var(--gh-heading)]">Meet the team</h2>
                </div>
                <p className="text-sm font-semibold text-[color:var(--gh-text-soft)]">People behind the experiences</p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {about.leadershipTeam.map((person, idx) => (
                  <div
                    key={`${person.name}-${idx}`}
                    className="group overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-[color:var(--gh-bg-soft)]"
                  >
                    <div className="relative aspect-[16/11] bg-[color:var(--gh-bg-soft)]">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url(${person.image?.url || ""})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/0 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-base font-black text-white">{person.name}</div>
                        <div className="text-sm font-semibold text-white/80">{person.designation}</div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm font-medium leading-7 text-[color:var(--gh-text-soft)]">
                        {person.bio}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {person.linkedinUrl && (
                          <a
                            className="inline-flex items-center justify-center rounded-xl border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-3 py-2 text-xs font-black text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-accent-soft)] hover:text-[color:var(--gh-accent)] transition-colors"
                            href={person.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LinkedIn
                          </a>
                        )}
                        {person.twitterUrl && (
                          <a
                            className="inline-flex items-center justify-center rounded-xl border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-3 py-2 text-xs font-black text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-accent-soft)] hover:text-[color:var(--gh-accent)] transition-colors"
                            href={person.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[linear-gradient(135deg,rgba(31,41,64,0.96),rgba(72,45,104,0.94)_52%,rgba(255,79,138,0.88))] p-7 shadow-[0_26px_80px_rgba(74,39,80,0.22)] sm:p-10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-white/60">Ready?</div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  Plan your next journey with GoldenHive
                </h2>
              </div>
              <Link
                href="/tour-packages"
                className="shrink-0 gh-primary-btn inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-sm font-black"
              >
                Explore packages
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
}

