import FootprintClient from "./FootprintClient";
import { fetchAllRoutes } from "../../lib/server/routes-data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FootprintPage() {
  const routes = await fetchAllRoutes();
  return <FootprintClient routes={routes} />;
}
