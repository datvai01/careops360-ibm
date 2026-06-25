export default function Slide10Q4DataReadiness() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: "6vh 6vw 5vh" }}>
        <div className="mb-[1vh]">
          <div className="font-display font-semibold tracking-[0.2em] uppercase" style={{ fontSize: "2.1vw", color: "#4589FF" }}>
            Q4 · Data Readiness
          </div>
        </div>
        <div className="font-display font-bold text-text mb-[1.5vh]" style={{ fontSize: "5vw", lineHeight: 1.1 }}>
          Current State & Enablement Path
        </div>
        <div className="bg-primary mb-[3.5vh]" style={{ width: "5vw", height: "0.4vh" }} />

        <div className="flex gap-[3vw] flex-1">
          <div className="flex-1 flex flex-col">
            <div
              className="font-display font-bold mb-[2.5vh]"
              style={{ fontSize: "3.2vw", color: "#4589FF" }}
            >
              Current State Assessment
            </div>

            <div className="mb-[2vh]">
              <div className="font-body font-semibold text-text mb-[1vh]" style={{ fontSize: "2.8vw" }}>
                Data strengths
              </div>
              <div className="font-body text-muted mb-[0.8vh]" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Structured claims data (EDI 837/835) — high volume and history
              </div>
              <div className="font-body text-muted mb-[0.8vh]" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Member enrollment records and product mapping
              </div>
              <div className="font-body text-muted" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Prior auth procedure and reviewer audit trail
              </div>
            </div>

            <div>
              <div className="font-body font-semibold text-text mb-[1vh]" style={{ fontSize: "2.8vw" }}>
                Gaps to address
              </div>
              <div className="font-body text-muted mb-[0.8vh]" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Fragmented source systems with no unified schema
              </div>
              <div className="font-body text-muted mb-[0.8vh]" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Limited real-time data feeds for AI inference
              </div>
              <div className="font-body text-muted" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Weak ML governance: lineage, versioning, audit
              </div>
            </div>
          </div>

          <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }} />

          <div className="flex-1 flex flex-col">
            <div
              className="font-display font-bold mb-[2.5vh]"
              style={{ fontSize: "3.2vw", color: "#4589FF" }}
            >
              IBM Requirements to Enable AI
            </div>

            <div className="mb-[2vh]">
              <div className="font-body font-semibold text-text mb-[1vh]" style={{ fontSize: "2.8vw" }}>
                Data access
              </div>
              <div className="font-body text-muted mb-[0.8vh]" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                FHIR R4 API access to clinical and administrative data
              </div>
              <div className="font-body text-muted" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Real-time event streaming (Kafka or equivalent)
              </div>
            </div>

            <div className="mb-[2vh]">
              <div className="font-body font-semibold text-text mb-[1vh]" style={{ fontSize: "2.8vw" }}>
                Governance
              </div>
              <div className="font-body text-muted mb-[0.8vh]" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                BAA expansion to cover watsonx processing
              </div>
              <div className="font-body text-muted" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Data anonymisation and audit logging framework
              </div>
            </div>

            <div>
              <div className="font-body font-semibold text-text mb-[1vh]" style={{ fontSize: "2.8vw" }}>
                Infrastructure
              </div>
              <div className="font-body text-muted mb-[0.8vh]" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                Data lakehouse with feature store for ML training
              </div>
              <div className="font-body text-muted" style={{ fontSize: "2.6vw", lineHeight: 1.6 }}>
                API credentials for all payer systems of record
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
