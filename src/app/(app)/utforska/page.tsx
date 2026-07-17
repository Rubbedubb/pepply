import type { Metadata } from "next";
import { ExploreLibrary } from "@/components/explore-library";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Utforska" };

export default function ExplorePage() {
  return (
    <>
      <PageHeader
        eyebrow="Kuraterat bibliotek"
        title="Lite att hitta. Inget att fastna i."
        description="Granskade meddelanden och korta reflektioner med ett tydligt slut — aldrig en oändlig feed."
      />
      <ExploreLibrary />
    </>
  );
}
