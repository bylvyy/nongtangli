import FootprintClient from "./FootprintClient";
import { ROUTES } from "../../lib/routes";

export default function FootprintPage() {
  return <FootprintClient routes={ROUTES} />;
}
