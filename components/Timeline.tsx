import type { Entry } from "@/lib/types";
import { safeUrl } from "@/lib/url";

export default function Timeline({ items }: { items: Entry[] }) {
  return (
    <ol className="timeline">
      {items.map((item, i) => (
        <li key={i} className="timeline-item">
          <p className="period">{item.period}</p>
          <div>
            <h3>{item.title || item.role || item.degree}</h3>
            <p className="org">{item.org || item.school}</p>
            {item.points && item.points.length > 0 && (
              <ul className="points">
                {item.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            )}
            {item.tech && <p className="tech">{item.tech}</p>}
            {safeUrl(item.image) && (
              <figure className="figure">
                <a href={safeUrl(item.image)} target="_blank" rel="noopener noreferrer">
                  <img src={safeUrl(item.image)} alt={item.caption || `Figure for ${item.title || item.role || ""}`} loading="lazy" />
                </a>
                {item.caption && <figcaption>{item.caption}</figcaption>}
              </figure>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
