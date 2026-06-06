import AutoriaHomePage from "@/components/home/AutoriaHomePage";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("nav");
  
  const navTranslations = {
    home: t("home"),
    services: t("services"),
    spareParts: t("spareParts"),
    dashboard: t("dashboard"),
    profile: t("profile"),
    subscription: t("subscription"),
    analytics: t("analytics"),
    promotions: t("promotions"),
    reservations: t("reservations"),
    logout: t("logout"),
    login: t("login"),
    signup: t("signup"),
  };

  return <AutoriaHomePage navTranslations={navTranslations} />;
}