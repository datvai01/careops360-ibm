// Gantt chart component (data-driven chart — allowed chart exception).
// Renders detailed per-initiative bars, milestone diamonds, and outcome annotations.
import { INITIATIVES, type Initiative } from '@/data/roadmap';

export const STATUS_COLORS: Record<string, string> = {
  Completed: '#24a148',
  Active: '#0f62fe',
  Planned: '#a6c8ff',
  'At Risk': '#da1e28',
};

const DOMAIN_COLORS = [
  '#0f62fe',
  '#007d79',
  '#8a3ffc',
  '#ff832b',
  '#d02670',
  '#4589ff',
  '#6929c4',
  '#005d5d',
];

export function categoryItems(cat: string): Initiative[] {
  return INITIATIVES.filter((i) => i.category === cat).sort((a, b) =>
    a.domain === b.domain
      ? a.start.localeCompare(b.start)
      : a.domain.localeCompare(b.domain),
  );
}

function monthNum(d: string): number {
  const [y, m, day] = d.split('-').map(Number);
  return y * 12 + (m - 1) + (day - 1) / 31;
}

function shortOutcome(s: string, max: number): string {
  const first = s.split(';')[0].trim().replace(/\.$/, '');
  return first.length > max ? first.slice(0, max - 1).trimEnd() + '…' : first;
}

const YEAR_THEMES: Record<number, string> = {
  2026: 'Year 1 · 2026 — Quick Wins & Foundation',
  2027: 'Year 2 · 2027 — Scale & Integration',
  2028: 'Year 3 · 2028 — Transform & Optimize',
};

export default function Gantt({
  category,
  startYear,
  endYear,
  bodyVh,
}: {
  category: string;
  startYear: number;
  endYear: number;
  bodyVh: number;
}) {
  const items = categoryItems(category);
  const t0 = startYear * 12;
  const span = (endYear + 1) * 12 - t0;
  const pct = (d: string) =>
    Math.min(100, Math.max(0, ((monthNum(d) - t0) / span) * 100));

  const domains = [...new Set(items.map((i) => i.domain))];
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);
  const nQuarters = years.length * 4;

  const headerUnits = domains.length * 0.62;
  const rowVh = bodyVh / (items.length + headerUnits);
  const headVh = rowVh * 0.62;

  const NAME_W = '17.5vw';
  const OUT_W = '21vw';

  return (
    <div className="w-full">
      {/* Year band */}
      <div className="flex" style={{ height: '2.6vh' }}>
        <div style={{ width: NAME_W }} />
        <div className="flex-1 flex">
          {years.map((y) => (
            <div
              key={y}
              className="flex items-center justify-center border-l border-navy/20 bg-navy/5"
              style={{ width: `${100 / years.length}%` }}
            >
              <span
                className="font-semibold text-navy uppercase tracking-wide"
                style={{ fontSize: '1vw' }}
              >
                {YEAR_THEMES[y] ?? y}
              </span>
            </div>
          ))}
        </div>
        <div style={{ width: OUT_W }} />
      </div>
      {/* Quarter band */}
      <div className="flex" style={{ height: '2.2vh' }}>
        <div
          className="flex items-center font-semibold uppercase tracking-wider text-muted"
          style={{ width: NAME_W, fontSize: '0.85vw' }}
        >
          Domain / Initiative
        </div>
        <div className="flex-1 flex border-b border-navy/15">
          {Array.from({ length: nQuarters }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-center border-l border-navy/10"
              style={{ width: `${100 / nQuarters}%` }}
            >
              <span className="text-muted font-medium" style={{ fontSize: '0.8vw' }}>
                Q{(i % 4) + 1}
              </span>
            </div>
          ))}
        </div>
        <div
          className="flex items-center pl-[0.8vw] font-semibold uppercase tracking-wider text-muted border-b border-navy/15"
          style={{ width: OUT_W, fontSize: '0.85vw' }}
        >
          Expected Outcome
        </div>
      </div>
      {/* Rows */}
      {domains.map((dom, di) => {
        const domColor = DOMAIN_COLORS[di % DOMAIN_COLORS.length];
        const domItems = items.filter((i) => i.domain === dom);
        return (
          <div key={dom}>
            <div className="flex items-center" style={{ height: `${headVh}vh` }}>
              <div className="flex items-center gap-[0.4vw]" style={{ width: NAME_W }}>
                <span
                  className="inline-block rounded-full"
                  style={{ width: '0.55vw', height: '0.55vw', background: domColor }}
                />
                <span
                  className="font-bold uppercase tracking-wide"
                  style={{ fontSize: '0.85vw', color: domColor }}
                >
                  {dom}
                </span>
              </div>
              <div className="flex-1 relative h-full">
                <div className="absolute inset-0 flex">
                  {Array.from({ length: nQuarters }, (_, i) => (
                    <div
                      key={i}
                      className="border-l border-navy/5 h-full"
                      style={{ width: `${100 / nQuarters}%` }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ width: OUT_W }} />
            </div>
            {domItems.map((it) => {
              const left = pct(it.start);
              const width = Math.max(1.5, pct(it.end) - left);
              const color = STATUS_COLORS[it.status] ?? '#a2a9b0';
              return (
                <div
                  key={it.name}
                  className="flex items-center border-t border-navy/5"
                  style={{ height: `${rowVh}vh` }}
                >
                  <div
                    className="pr-[0.6vw] truncate"
                    style={{
                      width: NAME_W,
                      fontSize: '0.85vw',
                      borderLeft: `0.22vw solid ${domColor}`,
                      paddingLeft: '0.5vw',
                    }}
                    title={it.name}
                  >
                    {it.name}
                  </div>
                  <div className="flex-1 relative h-full">
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: nQuarters }, (_, i) => (
                        <div
                          key={i}
                          className="border-l border-navy/5 h-full"
                          style={{ width: `${100 / nQuarters}%` }}
                        />
                      ))}
                    </div>
                    {/* Activity bar */}
                    <div
                      className="absolute rounded-[0.15vw]"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        top: '22%',
                        height: '56%',
                        background: color,
                        opacity: it.status === 'Planned' ? 0.9 : 1,
                      }}
                    />
                    {/* Start milestone */}
                    <div
                      className="absolute"
                      style={{
                        left: `calc(${left}% - 0.28vw)`,
                        top: '50%',
                        width: '0.56vw',
                        height: '0.56vw',
                        transform: 'translateY(-50%) rotate(45deg)',
                        background: '#f2f4f8',
                        border: `0.12vw solid ${color === '#a6c8ff' ? '#4589ff' : color}`,
                      }}
                    />
                    {/* End milestone (go-live / completion) */}
                    <div
                      className="absolute"
                      style={{
                        left: `calc(${left + width}% - 0.3vw)`,
                        top: '50%',
                        width: '0.6vw',
                        height: '0.6vw',
                        transform: 'translateY(-50%) rotate(45deg)',
                        background:
                          it.status === 'Completed' ? '#24a148' : '#001d6c',
                      }}
                    />
                  </div>
                  <div
                    className="pl-[0.8vw] truncate text-muted"
                    style={{ width: OUT_W, fontSize: '0.8vw' }}
                    title={it.outcome}
                  >
                    {shortOutcome(it.outcome, 78)}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function GanttLegend() {
  return (
    <div className="flex items-center gap-[1.6vw]">
      <div className="flex items-center gap-[0.4vw]">
        <span className="inline-block rounded-[0.1vw]" style={{ width: '1vw', height: '0.7vh', background: '#24a148' }} />
        <span className="text-muted" style={{ fontSize: '0.9vw' }}>Completed</span>
      </div>
      <div className="flex items-center gap-[0.4vw]">
        <span className="inline-block rounded-[0.1vw]" style={{ width: '1vw', height: '0.7vh', background: '#0f62fe' }} />
        <span className="text-muted" style={{ fontSize: '0.9vw' }}>Active</span>
      </div>
      <div className="flex items-center gap-[0.4vw]">
        <span className="inline-block rounded-[0.1vw]" style={{ width: '1vw', height: '0.7vh', background: '#a6c8ff' }} />
        <span className="text-muted" style={{ fontSize: '0.9vw' }}>Planned</span>
      </div>
      <div className="flex items-center gap-[0.4vw]">
        <span className="inline-block rounded-[0.1vw]" style={{ width: '1vw', height: '0.7vh', background: '#da1e28' }} />
        <span className="text-muted" style={{ fontSize: '0.9vw' }}>At Risk</span>
      </div>
      <div className="flex items-center gap-[0.4vw]">
        <span
          className="inline-block"
          style={{ width: '0.6vw', height: '0.6vw', transform: 'rotate(45deg)', background: '#001d6c' }}
        />
        <span className="text-muted" style={{ fontSize: '0.9vw' }}>Milestone (start ◇ / go-live ◆)</span>
      </div>
    </div>
  );
}
