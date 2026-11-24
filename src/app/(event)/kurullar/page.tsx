import { permanentRedirect } from "next/navigation";

// The old DSATalks committees address (printed and shared before the sites were merged).
export default function OldCommitteesPage() {
  permanentRedirect("/etkinlikler/dsatalks/kurullar");
}
