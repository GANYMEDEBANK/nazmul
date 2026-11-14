import data from "@/content/site.json";
import type { Site } from "@/lib/types";
import { doiUrl, safeUrl } from "@/lib/url";
import Section from "@/components/Section";
import Timeline from "@/components/Timeline";
import ThemeToggle from "@/components/ThemeToggle";

const site = data as Site;

const nav = [
  ["Home", "#home"],
  ["News", "#news"],
  ["Research", "#research"],
  ["Publications", "#publications"],
  ["Experience", "#experience"],
  ["Projects", "#projects"],
  ["Contact", "#contact"],
];

function Authors({ text, me }: { text: string; me: string }) {
  const parts = text.split(me);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <strong>{me}</strong>}
        </span>
      ))}
    </>
  );
}

export default function Home() {
  const p = site.profile;
  const photo = safeUrl(p.photo);
  const cv = safeUrl(p.cv);
  const links = [
    ["Google Scholar", safeUrl(p.scholar)],
    ["GitHub", safeUrl(p.github)],
    ["LinkedIn", safeUrl(p.linkedin)],
    ["CV", cv],
  ].filter(([, href]) => href);
  const initials = p.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const years = Array.from(new Set(site.publications.map((pub) => pub.year)));

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <a href="#home" className="brand">
            {p.name}
          </a>
          <nav aria-label="Sections">
            {nav.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="wrap hero-inner">
            <div className="hero-text">
              <p className="eyebrow">{p.role}</p>
              <h1>{p.headline}</h1>
              <p className="hero-tagline">{p.tagline}</p>
              <div className="hero-links">
                <a className="button" href="#publications">
                  Publications
                </a>
                {links.map(([label, href]) => (
                  <a key={label} className="button ghost" href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                ))}
              </div>
            </div>
            <div className="hero-art">
                <svg viewBox="0 0 320 320" role="img" aria-label="A reliability diagram, the chart used to check model calibration">
                  <rect x="40" y="40" width="240" height="240" fill="none" stroke="currentColor" strokeOpacity="0.35" />
                  {[100, 160, 220].map((v) => (
                    <g key={v} stroke="currentColor" strokeOpacity="0.14">
                      <line x1={v} y1="40" x2={v} y2="280" />
                      <line x1="40" y1={v} x2="280" y2={v} />
                    </g>
                  ))}
                  <line x1="40" y1="280" x2="280" y2="40" stroke="currentColor" strokeOpacity="0.55" strokeDasharray="6 6" />
                  <path d="M40 280 C 110 262, 150 232, 190 176 S 256 92, 280 64" fill="none" stroke="currentColor" strokeWidth="3" />
                  {[
                    [70, 271],
                    [110, 254],
                    [150, 224],
                    [190, 176],
                    [230, 118],
                    [262, 80],
                  ].map(([x, y]) => (
                    <circle key={x} cx={x} cy={y} r="5" fill="currentColor" />
                  ))}
                  <text x="160" y="306" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity="0.7">
                    confidence
                  </text>
                  <text x="22" y="160" textAnchor="middle" fontSize="12" fill="currentColor" fillOpacity="0.7" transform="rotate(-90 22 160)">
                    accuracy
                  </text>
                </svg>
            </div>
          </div>
        </section>

        <section className="mission">
          <div className="wrap">
            <p className="mission-statement">{site.focus.statement}</p>
            <p className="mission-body">{site.focus.body}</p>
          </div>
        </section>

        <Section id="about" index="01" title="About">
          <div className="about">
            {photo ? (
              <img src={photo} alt={p.name} className="portrait" />
            ) : (
              <div className="portrait placeholder" aria-hidden="true">
                {initials}
              </div>
            )}
            <div>
              <p className="lead">{p.bio}</p>
              {p.location && <p className="about-meta">{p.location}</p>}
            </div>
          </div>
          <div className="pillars">
            {site.pillars.map((pillar, i) => (
              <article key={i} className="pillar">
                <span className="pillar-no">{String(i + 1).padStart(2, "0")}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="news" index="02" title="News">
          <ul className="news">
            {site.news.map((item, i) => {
              const href = safeUrl(item.link);
              return (
                <li key={i}>
                  <span className="period">{item.date}</span>
                  <span>
                    {item.text}{" "}
                    {href && (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        Read more
                      </a>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="research" index="03" title="Research">
          <Timeline items={site.research} />
        </Section>

        <Section id="publications" index="04" title="Publications">
          {years.map((year) => (
            <div key={year} className="pub-year">
              <h3 className="year">{year}</h3>
              <ul className="pubs">
                {site.publications
                  .filter((pub) => pub.year === year)
                  .map((pub, i) => {
                    const href = doiUrl(pub.doi);
                    return (
                      <li key={i}>
                        <p className="pub-title">{pub.title}</p>
                        <p className="pub-authors">
                          <Authors text={pub.authors} me={p.name} />
                        </p>
                        <p className="pub-venue">
                          {pub.venue}
                          {href && (
                            <>
                              {" · "}
                              <a href={href} target="_blank" rel="noopener noreferrer">
                                DOI
                              </a>
                            </>
                          )}
                        </p>
                        {pub.note && <p className="pub-note">{pub.note}</p>}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </Section>

        <Section id="experience" index="05" title="Experience and Education">
          <Timeline items={[...site.experience, ...site.education]} />
        </Section>

        <Section id="projects" index="06" title="Projects">
          <div className="cards">
            {site.projects.map((project, i) => {
              const href = safeUrl(project.link);
              return (
                <article key={i} className="card">
                  <h3>{project.title}</h3>
                  <p>{project.text}</p>
                  <p className="tech">{project.tech}</p>
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      View project
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </Section>

        <Section id="more" index="07" title="Skills, Awards and Activities">
          <div className="columns">
            <div>
              <h3 className="sub">Skills</h3>
              <dl className="skills">
                {site.skills.map((skill, i) => (
                  <div key={i}>
                    <dt>{skill.label}</dt>
                    <dd>{skill.items}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="sub">Awards and Scholarships</h3>
              <ul className="plain">
                {site.awards.map((award, i) => (
                  <li key={i}>
                    <span className="period">{award.year}</span>
                    <span>{award.title}</span>
                  </li>
                ))}
              </ul>
              <h3 className="sub">Activities</h3>
              <ul className="plain">
                {site.activities.map((activity, i) => (
                  <li key={i}>
                    <span className="period">{activity.period}</span>
                    <span>
                      {activity.role}, {activity.org}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <section id="contact" className="contact">
          <div className="wrap">
            <h2>Get in touch</h2>
            {p.contact && <p>{p.contact}</p>}
            <div className="hero-links">
              {p.email && (
                <a className="button" href={`mailto:${p.email}`}>
                  {p.email}
                </a>
              )}
              {p.phone && (
                <a className="button ghost" href={`tel:${p.phone.replace(/[^+\d]/g, "")}`}>
                  {p.phone}
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <p>
            © {new Date().getFullYear()} {p.name}
            {p.location && ` · ${p.location}`}
          </p>
          <p>
            {links.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </p>
        </div>
      </footer>
    </>
  );
}
