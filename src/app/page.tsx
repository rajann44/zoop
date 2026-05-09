import { QuickBodySetup } from "@/components/home/quick-body-setup";
import { PreviewSampleWeekButton } from "@/components/home/preview-sample-week-button";
import { TransitionLink } from "@/components/ui/transition-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/locales";

export default function Home() {
  return (
    <div className="liquid-canvas min-h-screen">
      <header className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="glass-header mx-auto flex max-w-6xl items-center rounded-[22px] px-4 py-3 sm:px-5">
          <TransitionLink href="/planner" className="rounded-lg px-1 py-0.5 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <h1 className="font-serif text-xl">zoop</h1>
            <p className="text-sm text-muted-foreground">{t.common.appTagline}</p>
          </TransitionLink>
        </div>
      </header>

      <main className="px-3 pt-3 pb-8 sm:px-4 sm:pt-4 sm:pb-10">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
          <section className="w-full space-y-4 sm:space-y-5">
            <div className="glass rounded-[22px] p-5 sm:p-8">
              <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div className="space-y-4 sm:space-y-5">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground sm:text-sm">{t.home.hero.eyebrow}</p>
                  <h1 className="max-w-3xl font-serif text-3xl leading-[1.08] tracking-tight sm:text-[3.2rem]">
                    {t.home.hero.title}
                  </h1>
                  <p className="max-w-3xl text-sm text-muted-foreground sm:text-lg">
                    {t.home.hero.description}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 lg:items-end lg:pt-24">
                  <PreviewSampleWeekButton label={t.home.hero.previewCta} />
                  <TransitionLink href="/planner" className="rounded-md px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {t.home.hero.customizeLink}
                  </TransitionLink>
                </div>
              </div>
            </div>

            <QuickBodySetup />

            <Card>
              <CardHeader>
                <CardTitle>{t.home.whatYouGet.title}</CardTitle>
                <CardDescription>{t.home.whatYouGet.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {t.home.whatYouGet.bullets.map((bullet) => (
                  <p key={bullet}>- {bullet}</p>
                ))}
              </CardContent>
            </Card>
          </section>

          <footer className="mt-auto px-1 pt-8 text-xs text-muted-foreground sm:pt-10">
            {t.home.footer}
          </footer>
        </div>
      </main>
    </div>
  );
}
