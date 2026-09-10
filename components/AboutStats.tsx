import { getTranslations } from "next-intl/server";
import ShieldIcon from "@/components/icons/ShieldIcon";
import ClipboardCheckIcon from "@/components/icons/ClipboardCheckIcon";
import SupportIcon from "@/components/icons/SupportIcon";
import BuildingsIcon from "@/components/icons/BuildingsIcon";

const pillars = [
  { titleKey: "aboutPillar1Title", bodyKey: "aboutPillar1Body", Icon: ShieldIcon },
  { titleKey: "aboutPillar2Title", bodyKey: "aboutPillar2Body", Icon: ClipboardCheckIcon },
  { titleKey: "aboutPillar3Title", bodyKey: "aboutPillar3Body", Icon: SupportIcon },
  { titleKey: "aboutPillar4Title", bodyKey: "aboutPillar4Body", Icon: BuildingsIcon },
] as const;

export default async function AboutStats() {
  const t = await getTranslations("home");

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold text-brand-950 sm:text-4xl">{t("aboutTitle")}</h2>
          <p className="mt-4 max-w-xl text-brand-600">{t("aboutBody")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pillars.map(({ titleKey, bodyKey, Icon }) => (
            <div
              key={titleKey}
              className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-white p-6 shadow-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-brand-950">{t(titleKey)}</p>
                <p className="mt-1 text-sm leading-relaxed text-brand-600">{t(bodyKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
