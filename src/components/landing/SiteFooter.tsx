import { Drumstick, Instagram, Mail, Phone } from "lucide-react";
import type { SiteContent } from "@/lib/site-content";

export function SiteFooter({ content }: { content: SiteContent }) {
  const t = content.texts;
  const logo = content.images.footerLogo;

  return (
    <footer className="bg-ink py-14 text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 text-center md:grid-cols-3">
        <div className="flex flex-col items-center">
          <div className="flex min-w-0 items-center justify-center gap-2">
            {logo ? (
              <img src={logo} alt="Ben's Chicken" className="h-12 w-auto object-contain" />
            ) : (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground">
                  <Drumstick className="h-5 w-5" />
                </span>
                <span className="truncate text-lg font-extrabold">
                  Ben&apos;s <span className="text-brand">Chicken</span>
                </span>
              </>
            )}
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-75">{t.footerAbout}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-brand">
            {t.footerContactTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-brand" />
              {t.footerPhoneLink ? (
                <a
                  href={t.footerPhoneLink}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand"
                >
                  {t.footerPhone}
                </a>
              ) : (
                t.footerPhone
              )}
            </li>
            <li className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-brand" />
              <a href={`mailto:${t.footerEmail}`} className="hover:text-brand">
                {t.footerEmail}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 shrink-0 text-brand" />
              {t.footerInstagramLink ? (
                <a
                  href={t.footerInstagramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand"
                >
                  {t.footerInstagram}
                </a>
              ) : (
                t.footerInstagram
              )}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-brand">
            {t.footerLinksTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li>
              <a href="#modelos" className="hover:text-brand">
                {t.footerLink1}
              </a>
            </li>
            <li>
              <a href="#numeros" className="hover:text-brand">
                {t.footerLink2}
              </a>
            </li>
            <li>
              <a href="#form" className="hover:text-brand">
                {t.footerLink3}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-ink-foreground/15 px-4 pt-6 text-xs opacity-60">
        © {new Date().getFullYear()} Ben&apos;s Chicken. {t.footerLegal}
      </div>
    </footer>
  );
}
