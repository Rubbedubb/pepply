import type { Metadata } from "next";
import { HomeDashboard } from "@/components/home-dashboard";
import { getHomeData } from "@/lib/app-data";

export const metadata: Metadata = { title: "Hem" };

export default async function HomePage() {
  const data = await getHomeData();
  return <HomeDashboard data={data} />;
}
