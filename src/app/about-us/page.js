import Link from "next/link";
import { apiService } from "../../services/api.service";

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
      <main className="bg-slate-50">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">About Us</h1>
          <p className="mt-3 max-w-xl text-sm font-semibold text-slate-600">
            Content is not available right now. Please try again later.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white hover:bg-emerald-600"
          >
            Back to Home
          </Link>
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
    <main className="bg-slate-50">
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
                  <Link
                    href="#mission"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] hover:bg-emerald-600"
                  >
                    Our mission
                  </Link>
                  <Link
                    href="/tour-packages"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white backdrop-blur hover:bg-white/15"
                  >
                    Explore packages
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-6xl space-y-10 px-5 py-12">
          {show.banners && (
            <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Moments</h2>
                <p className="text-sm font-semibold text-slate-500">A peek into the experience</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {about.bannerImages.map((img, idx) => (
                  <div
                    key={img.url || idx}
                    className="group relative aspect-[16/10] overflow-hidden rounded-3xl border border-black/5 bg-slate-100"
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
              <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Mission</div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">What we promise</h2>
                <p className="mt-4 text-[15px] font-medium leading-7 text-slate-600">
                  {about.missionStatement}
                </p>
              </div>
              <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Vision</div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Where we are headed</h2>
                <p className="mt-4 text-[15px] font-medium leading-7 text-slate-600">
                  {about.visionStatement}
                </p>
              </div>
            </section>
          )}

          {show.coreValues && (
            <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Core values</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">How we work</h2>
                </div>
                <p className="text-sm font-semibold text-slate-500">Principles that guide every trip</p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {about.coreValues.map((value, idx) => (
                  <div
                    key={`${value.title}-${idx}`}
                    className="group rounded-3xl border border-black/5 bg-slate-50 p-6 transition hover:bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${value.iconImage?.url || ""})` }}
                        />
                      </div>
                      <div className="text-base font-black text-slate-900">{value.title}</div>
                    </div>
                    <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {show.ourStory && (
            <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Our story</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    {about.ourStoryHeading || "Our story"}
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-[15px] font-medium leading-7 text-slate-600">
                    {about.ourStoryContent}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {(about.storyImages || []).map((img, idx) => (
                    <div
                      key={img.url || idx}
                      className="group relative aspect-[16/10] overflow-hidden rounded-3xl border border-black/5 bg-slate-100"
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
            <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Gallery</h2>
                <p className="text-sm font-semibold text-slate-500">Memories we build together</p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {about.galleryImages.map((img, idx) => (
                  <div
                    key={img.url || idx}
                    className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-black/5 bg-slate-100"
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
            <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">By the numbers</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Impact</h2>
                </div>
                <p className="text-sm font-semibold text-slate-500">Growing with every journey</p>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {about.stats.map((stat, idx) => (
                  <div
                    key={`${stat.label}-${idx}`}
                    className="rounded-3xl border border-black/5 bg-slate-50 p-6"
                  >
                    <div className="text-3xl font-black tracking-tight text-slate-900">{stat.value}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-600">{stat.label}</div>
                    <div className="mt-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {stat.icon || "stat"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {show.leadership && (
            <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Leadership</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Meet the team</h2>
                </div>
                <p className="text-sm font-semibold text-slate-500">People behind the experiences</p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {about.leadershipTeam.map((person, idx) => (
                  <div
                    key={`${person.name}-${idx}`}
                    className="group overflow-hidden rounded-3xl border border-black/5 bg-slate-50"
                  >
                    <div className="relative aspect-[16/11] bg-slate-200">
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
                    <div className="p-6">
                      <p className="text-sm font-medium leading-7 text-slate-600">
                        {person.bio}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {person.linkedinUrl && (
                          <a
                            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-50"
                            href={person.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LinkedIn
                          </a>
                        )}
                        {person.twitterUrl && (
                          <a
                            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-slate-900 hover:bg-slate-50"
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

          <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Ready?</div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  Plan your next journey with GoldenHive
                </h2>
              </div>
              <Link
                href="/tour-packages"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white hover:bg-emerald-600"
              >
                Explore packages
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
}

