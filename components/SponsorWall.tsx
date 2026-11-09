"use client";

export default function SponsorWall() {
  const sponsors = [
    { name: "NIRMAN", tier: "title", color: "#ff6a00" },
    { name: "SILICON UNIVERSITY", tier: "gold", color: "#ffbe28" },
    { name: "BCET", tier: "gold", color: "#ffbe28" },
    { name: "KIIT", tier: "silver", color: "#c8dcf0" },
    { name: "RedBull", tier: "silver", color: "#c8dcf0" },
    { name: "IEEE", tier: "silver", color: "#c8dcf0" },
    { name: "IETE", tier: "partner", color: "#8da3be" },
    { name: "ACM", tier: "partner", color: "#8da3be" },
    { name: "SAE India", tier: "partner", color: "#8da3be" },
    { name: "Make in India", tier: "partner", color: "#8da3be" },
  ];

  const tierGroups = {
    title: sponsors.filter(s => s.tier === "title"),
    gold: sponsors.filter(s => s.tier === "gold"),
    silver: sponsors.filter(s => s.tier === "silver"),
    partner: sponsors.filter(s => s.tier === "partner"),
  };

  const tierConfig: Record<string, { label: string; height: number; fontSize: number }> = {
    title: { label: "TITLE SPONSOR", height: 80, fontSize: 20 },
    gold: { label: "GOLD SPONSORS", height: 60, fontSize: 15 },
    silver: { label: "SILVER SPONSORS", height: 48, fontSize: 13 },
    partner: { label: "COMMUNITY PARTNERS", height: 40, fontSize: 11 },
  };

  return (
    <section
      style={{
        marginTop: 40,
        padding: "36px 28px",
        borderRadius: 20,
        background: "rgba(8, 14, 24, 0.7)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(45, 75, 110, 0.35)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 300,
          background: "radial-gradient(ellipse, rgba(255, 106, 0, 0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Section Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 14px",
            borderRadius: 999,
            background: "rgba(255, 170, 0, 0.08)",
            border: "1px solid rgba(255, 170, 0, 0.25)",
            color: "#ffaa00",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            marginBottom: 10,
          }}
        >
          ★ POWERED BY
        </div>
        <h2
          className="digital"
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#fff",
            margin: 0,
          }}
        >
          SPONSORS & PARTNERS
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#6c84a0",
            marginTop: 6,
          }}
        >
          Supporting NIRMAN 6.0 — Line Follower Robotics Competition
        </p>
      </div>

      {/* Tier Rows */}
      {(["title", "gold", "silver", "partner"] as const).map((tier) => {
        const group = tierGroups[tier];
        if (group.length === 0) return null;
        const cfg = tierConfig[tier];
        return (
          <div key={tier} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.22em",
                color: "#4a6080",
                textAlign: "center",
                marginBottom: 12,
                textTransform: "uppercase",
              }}
            >
              {cfg.label}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {group.map((sponsor) => (
                <div
                  key={sponsor.name}
                  style={{
                    height: cfg.height,
                    minWidth: cfg.height * 2.2,
                    padding: "0 20px",
                    borderRadius: 12,
                    background: "rgba(12, 20, 34, 0.8)",
                    border: `1px solid ${
                      tier === "title"
                        ? "rgba(255, 106, 0, 0.4)"
                        : tier === "gold"
                        ? "rgba(255, 190, 40, 0.3)"
                        : "rgba(45, 75, 110, 0.4)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      tier === "title"
                        ? "0 0 20px rgba(255, 106, 0, 0.12)"
                        : tier === "gold"
                        ? "0 0 14px rgba(255, 190, 40, 0.08)"
                        : "none",
                    transition: "all 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${sponsor.color}66`;
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      tier === "title"
                        ? "rgba(255, 106, 0, 0.4)"
                        : tier === "gold"
                        ? "rgba(255, 190, 40, 0.3)"
                        : "rgba(45, 75, 110, 0.4)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  <span
                    className="digital"
                    style={{
                      fontSize: cfg.fontSize,
                      fontWeight: 800,
                      color: sponsor.color,
                      letterSpacing: "0.08em",
                      textAlign: "center",
                      opacity: tier === "partner" ? 0.7 : 1,
                    }}
                  >
                    {sponsor.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Call to action */}
      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid rgba(45, 75, 110, 0.2)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#4a6080",
          }}
        >
          Interested in sponsoring NIRMAN 6.0?{" "}
          <a
            href="mailto:nirman@example.com"
            style={{ color: "#00f0ff", textDecoration: "none" }}
          >
            Contact us →
          </a>
        </span>
      </div>
    </section>
  );
}
