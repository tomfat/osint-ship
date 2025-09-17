import Link from "next/link";

export default function MethodologyPage() {
  return (
    <article className="prose prose-invert max-w-3xl">
      <h1>Methodology &amp; Safeguards</h1>
      <p>
        OSINT Carrier Tracker is designed as a delayed-intelligence portal. We prioritize transparency, ethical sourcing, and
        operational security over real-time reporting. The workflow combines automated ingestion with human oversight to
        maintain verifiable records.
      </p>
      <h2>Collection Pipeline</h2>
      <ol>
        <li>
          <strong>Signal ingestion:</strong> RSS feeds, official press releases, social media monitoring, and maritime analytics
          provide candidate stories.
        </li>
        <li>
          <strong>AI triage:</strong> Language models extract vessel names, timestamps, and geolocations into a structured draft.
        </li>
        <li>
          <strong>Human review:</strong> Editors verify provenance, confidence, and geospatial plausibility before approval.
        </li>
      </ol>
      <h2>Confidence Ratings</h2>
      <p>
        Confidence scores communicate how well-corroborated an event is. “High” entries originate from official statements or
        multi-source confirmation. “Medium” entries typically rely on reputable media or photographic evidence. “Low” denotes
        speculative or single-source OSINT that still merits tracking.
      </p>
      <h2>Delay &amp; Obfuscation</h2>
      <p>
        To avoid operational risk, coordinates are generalized to 0.1°–1° and may be withheld entirely when sensitive. Events
        older than 14 days trigger an automatic “position unknown” reminder for analyst follow-up.
      </p>
      <p>
        Interested in contributing vetted leads? Contact the maintainers via the <Link href="/about">about page</Link> to join
        the closed beta of the reviewer workflow.
      </p>
    </article>
  );
}
