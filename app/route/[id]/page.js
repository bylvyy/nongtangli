import { notFound } from "next/navigation";
import { fetchRouteById } from "../../../lib/server/routes-data";
import RouteDetailClient from "./RouteDetailClient";

export const runtime = "edge";
export const revalidate = 300;

export default async function RouteDetailPage({ params }) {
  const route = await fetchRouteById(params.id);
  if (!route) return notFound();
  return <RouteDetailClient route={route} />;
}
