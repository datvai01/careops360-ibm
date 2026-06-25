export default function Slide06Q2TeamStructure() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: "6vh 6vw 5vh" }}>
        <div className="mb-[1vh]">
          <div className="font-display font-semibold tracking-[0.2em] uppercase" style={{ fontSize: "2.1vw", color: "#4589FF" }}>
            Q2 · Team Structure
          </div>
        </div>
        <div className="font-display font-bold text-text mb-[1.5vh]" style={{ fontSize: "5vw", lineHeight: 1.1 }}>
          From Project Funding to Product Pods
        </div>
        <div className="bg-primary mb-[3.5vh]" style={{ width: "5vw", height: "0.4vh" }} />

        <div className="flex gap-[2vw] flex-1 items-stretch">
          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-body font-semibold mb-[1.5vh]" style={{ fontSize: "2.4vw", color: "#8D9298", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Today
            </div>
            <div className="font-display font-bold text-text mb-[2vh]" style={{ fontSize: "3.5vw" }}>
              Project-Funded Silos
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Teams organised by function, not product
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              IBM augments existing project delivery
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Funding tied to individual project budgets
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Limited cross-domain collaboration
            </div>
          </div>

          <div
            className="flex items-center justify-center"
            style={{ width: "4vw", color: "#0F62FE", fontSize: "4vw", fontWeight: 700 }}
          >
            →
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(15, 98, 254, 0.1)",
              border: "1px solid rgba(15, 98, 254, 0.25)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-body font-semibold mb-[1.5vh]" style={{ fontSize: "2.4vw", color: "#4589FF", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              6 Months
            </div>
            <div className="font-display font-bold text-text mb-[2vh]" style={{ fontSize: "3.5vw" }}>
              Hybrid Pod Model
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              2 pilot cross-functional delivery pods
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Each pod: 6-8 members aligned to a product domain
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              IBM co-leads pod with Horizon product owner
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Project funding retained; pod cadence adopted
            </div>
          </div>

          <div
            className="flex items-center justify-center"
            style={{ width: "4vw", color: "#0F62FE", fontSize: "4vw", fontWeight: 700 }}
          >
            →
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-body font-semibold mb-[1.5vh]" style={{ fontSize: "2.4vw", color: "#8D9298", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              18 Months+
            </div>
            <div className="font-display font-bold text-text mb-[2vh]" style={{ fontSize: "3.5vw" }}>
              Product-Funded Steady State
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              6-8 persistent product pods operating
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Funding transitions to product-level allocation
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              IBM shifts to platform and advisory role
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Horizon teams own full product backlogs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
