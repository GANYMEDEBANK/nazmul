export default function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="section">
      <div className="wrap">
        <header className="section-head">
          <span className="section-index">{index}</span>
          <h2>{title}</h2>
        </header>
        {children}
      </div>
    </section>
  );
}
