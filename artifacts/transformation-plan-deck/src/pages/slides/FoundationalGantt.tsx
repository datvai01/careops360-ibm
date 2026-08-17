import Gantt, { GanttLegend } from '@/components/Gantt';

export default function FoundationalGantt() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute top-0 left-0 w-full h-[0.8vh] bg-primary" />
      <div className="px-[3vw] pt-[3.2vh] flex items-end justify-between">
        <div>
          <h2 className="text-navy font-bold tracking-tight" style={{ fontSize: '2.4vw' }}>
            Foundational Initiatives
          </h2>
          <p className="text-muted" style={{ fontSize: '1.05vw' }}>
            19 initiatives · Year 1 2026 — the operating platform: AIOps, governance, delivery transformation
          </p>
        </div>
        <GanttLegend />
      </div>
      <div className="px-[3vw] mt-[1.6vh]">
        <Gantt category="Foundational" startYear={2026} endYear={2026} bodyVh={76} />
      </div>
    </div>
  );
}
