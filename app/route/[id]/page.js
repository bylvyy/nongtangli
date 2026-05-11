import { notFound } from "next/navigation";
import { ROUTES, getRouteById } from "../../../lib/routes";
import RouteDetailClient from "./RouteDetailClient";

export function generateStaticParams() {
  return ROUTES.map((r) => ({ id: r.id }));
}

export default function RouteDetailPage({ params }) {
  const route = getRouteById(params.id);
  if (!route) return notFound();
  return <RouteDetailClient route={route} />;
}
