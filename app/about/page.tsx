export default function AboutPage() {
  return (
    <article className="prose prose-invert max-w-3xl">
      <h1>About the Project</h1>
      <p>
        OSINT Carrier Tracker is a volunteer-led initiative that documents the last publicly verified positions of U.S. Navy
        aircraft carriers. The project blends open-source research with structured data modeling to help journalists,
        researchers, and defense observers contextualize carrier deployments.
      </p>
      <h2>Team Principles</h2>
      <ul>
        <li>
          <strong>Legal compliance:</strong> We only use information that is already public and honor the terms of service for
          each source.
        </li>
        <li>
          <strong>Safety aware:</strong> Location data is delayed or obfuscated to protect operational security.
        </li>
        <li>
          <strong>Documented decisions:</strong> Analysts capture review notes and confidence changes for every entry.
        </li>
      </ul>
      <h2>Contact</h2>
      <p>
        We are exploring partnerships with media outlets and OSINT communities. For inquiries or to request data access, email
        <a href="mailto:team@osintcarriertracker.org"> team@osintcarriertracker.org</a>.
      </p>
    </article>
  );
}
