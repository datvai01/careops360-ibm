export default function TransformationRoadmap() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      {/* Top brand rule */}
      <div className="absolute top-0 left-0 w-full h-[0.7vh] bg-primary" />

      {/* Header */}
      <div className="absolute top-[1.8vh] left-[3vw] right-[3vw] flex items-end justify-between">
        <div>
          <div className="text-[1.5vw] font-semibold text-primary tracking-wide uppercase">
            CareOps360 · IBM × Horizon BCBS
          </div>
          <div className="font-display text-[2.2vw] font-extrabold tracking-tight leading-tight">
            CareOps360 Transformation — 30-60-90 Day Plan
          </div>
        </div>
        <div className="text-right pb-[0.5vh] text-[1.5vw] text-muted font-medium">
          From the Horizon AMS Reinvention transition plan
        </div>
      </div>

      {/* ===== THREE PHASE COLUMNS ===== */}
      <div className="absolute top-[10.5vh] left-[3vw] right-[3vw] bottom-[13vh] flex gap-[1.4vw]">

        {/* --- DAY 0-30 --- */}
        <div className="flex-1 bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#0f62fe] text-white px-[1vw] py-[1vh]">
            <div className="text-[1.9vw] font-extrabold leading-none">Day 0–30</div>
            <div className="text-[1.5vw] font-medium opacity-90 mt-[0.4vh]">Foundation — stand up the MVP</div>
          </div>
          <div className="px-[1vw] py-[1vh] space-y-[1vh] flex-1">
            <div className="flex gap-[0.5vw]">
              <span className="text-[#0f62fe] text-[1.5vw] font-bold shrink-0">01</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">MVP scope, dashboard personas</span> &amp; success criteria</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#0f62fe] text-[1.5vw] font-bold shrink-0">02</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">ARB Light approval</span> &amp; MVP deployment architecture</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#0f62fe] text-[1.5vw] font-bold shrink-0">03</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Deploy containerized CareOps360</span> to OCP / AWS dev</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#0f62fe] text-[1.5vw] font-bold shrink-0">04</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">RDS Postgres schema</span> &amp; baseline dashboard data model</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#0f62fe] text-[1.5vw] font-bold shrink-0">05</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Initial data loads</span> — Exec Overview, Claims, Prior Auth, Providers</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#0f62fe] text-[1.5vw] font-bold shrink-0">06</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Dashboard layouts, KPI definitions</span> &amp; role-based access</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#0f62fe] text-[1.5vw] font-bold shrink-0">07</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">MVP playback</span> &amp; production-hardening backlog</div>
            </div>
          </div>
          <div className="px-[1vw] py-[0.9vh] bg-[#0f62fe]/10 border-t border-[#0f62fe]/20 text-[1.5vw] leading-snug">
            <span className="font-bold text-[#0f62fe]">Exit:</span> MVP live in dev, playback done
          </div>
        </div>

        {/* --- DAY 31-60 --- */}
        <div className="flex-1 bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#6929c4] text-white px-[1vw] py-[1vh]">
            <div className="text-[1.9vw] font-extrabold leading-none">Day 31–60</div>
            <div className="text-[1.5vw] font-medium opacity-90 mt-[0.4vh]">Production ready — harden &amp; design target state</div>
          </div>
          <div className="px-[1vw] py-[1vh] space-y-[1.2vh] flex-1">
            <div className="flex gap-[0.5vw]">
              <span className="text-[#6929c4] text-[1.5vw] font-bold shrink-0">01</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Promote MVP to production</span> through Horizon release process with SSO &amp; RBAC configured</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#6929c4] text-[1.5vw] font-bold shrink-0">02</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Design near-real-time target architecture</span> with Kafka / MSK and data contracts</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#6929c4] text-[1.5vw] font-bold shrink-0">03</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">ARB approval</span> for the target CareOps360 architecture</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#6929c4] text-[1.5vw] font-bold shrink-0">04</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Operating model</span> — support model &amp; product ownership cadence</div>
            </div>
          </div>
          <div className="px-[1vw] py-[0.9vh] bg-[#6929c4]/10 border-t border-[#6929c4]/20 text-[1.5vw] leading-snug">
            <span className="font-bold text-[#6929c4]">Exit:</span> prod MVP, approved architecture
          </div>
        </div>

        {/* --- DAY 61-90 --- */}
        <div className="flex-1 bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-[#1192e8] text-white px-[1vw] py-[1vh]">
            <div className="text-[1.9vw] font-extrabold leading-none">Day 61–90</div>
            <div className="text-[1.5vw] font-medium opacity-90 mt-[0.4vh]">Standardize &amp; integrate — automate the data</div>
          </div>
          <div className="px-[1vw] py-[1vh] space-y-[1.2vh] flex-1">
            <div className="flex gap-[0.5vw]">
              <span className="text-[#1192e8] text-[1.5vw] font-bold shrink-0">01</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Build ingestion platform</span> in AWS with infrastructure-as-code, MSK &amp; observability</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#1192e8] text-[1.5vw] font-bold shrink-0">02</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Automate top 4–6 sources</span> — ServiceNow, APM, Databricks</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#1192e8] text-[1.5vw] font-bold shrink-0">03</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Enable remaining dashboard tiles</span> &amp; validate data-quality rules</div>
            </div>
            <div className="flex gap-[0.5vw]">
              <span className="text-[#1192e8] text-[1.5vw] font-bold shrink-0">04</span>
              <div className="text-[1.5vw] leading-snug"><span className="font-semibold">Publish adoption plan</span> — training assets &amp; leadership consumption cadence</div>
            </div>
          </div>
          <div className="px-[1vw] py-[0.9vh] bg-[#1192e8]/10 border-t border-[#1192e8]/20 text-[1.5vw] leading-snug">
            <span className="font-bold text-[#1192e8]">Exit:</span> ingestion live, adoption pack
          </div>
        </div>
      </div>

      {/* Beyond day 90 strip */}
      <div className="absolute bottom-[5.4vh] left-[3vw] right-[3vw] bg-[#0b2e6b] text-white rounded-md px-[1vw] py-[0.9vh] flex items-center gap-[1vw]">
        <span className="text-[1.5vw] font-bold text-[#8ab4ff] uppercase tracking-wide shrink-0">Beyond Day 90</span>
        <span className="text-[1.5vw] leading-snug">Scale &amp; optimize — remaining sources · AI Insights &amp; Copilot · ServiceNow/Jira write-back · HA/DR hardening · 180-day value review</span>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[1.4vh] left-[3vw] right-[3vw] flex items-center justify-between">
        <div className="text-[1.5vw] text-muted">Source: AMS Reinvention transition plan — CareOps360 workstream</div>
        <div className="text-[1.5vw] font-semibold text-muted">IBM Confidential · Demonstration · 2026</div>
      </div>
    </div>
  );
}
