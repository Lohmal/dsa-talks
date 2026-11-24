import Header from "@/components/Header";
import Committees from "@/components/Committees";
import Footer from "@/components/Footer";

// The committees page of an event year.
export default function EventCommittees() {
  return (
    <>
      <Header />
      <main>
        <Committees />
      </main>
      <Footer />
    </>
  );
}
