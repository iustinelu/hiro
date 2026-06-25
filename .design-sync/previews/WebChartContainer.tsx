import { WebChartContainer } from "@hiro/ui-primitives/web";

const wrap = { maxWidth: 420 } as const;

const barRow = {
  display: "flex",
  alignItems: "flex-end",
  gap: 10,
  height: 120
} as const;

const Bar = ({ h, label }: { h: number; label: string }) => (
  <div style={{ display: "grid", gap: 6, justifyItems: "center", flex: 1 }}>
    <div
      style={{
        width: "100%",
        height: h,
        borderRadius: 6,
        background: "var(--hiro-color-accent)"
      }}
    />
    <span style={{ fontSize: 11, color: "var(--hiro-color-ink-muted)" }}>{label}</span>
  </div>
);

export const WeeklyCompletion = () => (
  <div style={wrap}>
    <WebChartContainer title="Chores completed" subtitle="Last 7 days">
      <div style={barRow}>
        <Bar h={48} label="Mon" />
        <Bar h={72} label="Tue" />
        <Bar h={60} label="Wed" />
        <Bar h={96} label="Thu" />
        <Bar h={84} label="Fri" />
        <Bar h={36} label="Sat" />
        <Bar h={108} label="Sun" />
      </div>
    </WebChartContainer>
  </div>
);

export const PointsTrend = () => (
  <div style={wrap}>
    <WebChartContainer title="Points earned" subtitle="Maya is leading this month">
      <svg viewBox="0 0 300 90" width="100%" height="90" preserveAspectRatio="none">
        <polyline
          points="0,70 50,55 100,60 150,30 200,38 250,18 300,10"
          fill="none"
          stroke="var(--hiro-color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </WebChartContainer>
  </div>
);

export const TitleOnly = () => (
  <div style={wrap}>
    <WebChartContainer title="Budget breakdown">
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { label: "Groceries", pct: 62 },
          { label: "Utilities", pct: 24 },
          { label: "Supplies", pct: 14 }
        ].map((seg) => (
          <div key={seg.label} style={{ display: "grid", gap: 4 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "var(--hiro-color-ink-muted)"
              }}
            >
              <span>{seg.label}</span>
              <span>{seg.pct}%</span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: "var(--hiro-color-surface-muted)"
              }}
            >
              <div
                style={{
                  width: `${seg.pct}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: "var(--hiro-color-accent)"
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </WebChartContainer>
  </div>
);
