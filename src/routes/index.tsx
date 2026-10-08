import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mesa Cero — Inteligencia de negocio para restaurantes" },
      {
        name: "description",
        content: "Panel financiero y copiloto de IA para restaurantes, cafeterías y bares.",
      },
      { property: "og:title", content: "Mesa Cero — Inteligencia de negocio para restaurantes" },
      {
        property: "og:description",
        content:
          "Dashboard financiero y copiloto de IA para restaurantes: menús, equipo e informes ejecutivos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});
