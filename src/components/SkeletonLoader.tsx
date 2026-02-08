"use client";

export function Skeleton({ width, height, borderRadius = "8px", style }: {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-stats-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-stat-card">
          <Skeleton width="48px" height="48px" borderRadius="12px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="60px" height="28px" />
            <Skeleton width="100px" height="14px" style={{ marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={`${60 + Math.random() * 40}px`} height="12px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} width={`${50 + Math.random() * 60}%`} height="14px" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <Skeleton width="40px" height="40px" borderRadius="10px" />
            <Skeleton width="70px" height="22px" borderRadius="20px" />
          </div>
          <Skeleton width="70%" height="18px" />
          <Skeleton width="90%" height="14px" style={{ marginTop: 8 }} />
          <Skeleton width="50%" height="14px" style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="skeleton-detail">
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <Skeleton width="64px" height="64px" borderRadius="50%" />
        <div>
          <Skeleton width="180px" height="22px" />
          <Skeleton width="80px" height="18px" style={{ marginTop: 8 }} borderRadius="20px" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Skeleton width="20px" height="20px" borderRadius="4px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="80px" height="12px" />
            <Skeleton width="160px" height="16px" style={{ marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <StatCardSkeleton count={4} />
      <div style={{ marginTop: 32 }}>
        <Skeleton width="140px" height="22px" style={{ marginBottom: 16 }} />
        <CardGridSkeleton count={4} />
      </div>
      <div style={{ marginTop: 32 }}>
        <Skeleton width="160px" height="22px" style={{ marginBottom: 16 }} />
        <TableSkeleton rows={5} columns={4} />
      </div>
      <SkeletonStyles />
    </>
  );
}

export function SkeletonStyles() {
  return (
    <style jsx global>{`
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }

      .skeleton-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
        display: block;
      }

      .skeleton-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }

      .skeleton-stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: white;
        border-radius: 12px;
        border: 1px solid var(--border-color);
      }

      .skeleton-table {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        overflow: hidden;
      }

      .skeleton-table-header {
        display: flex;
        gap: 24px;
        padding: 14px 20px;
        background: #f8fafc;
        border-bottom: 1px solid var(--border-color);
      }

      .skeleton-table-row {
        display: flex;
        gap: 24px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color);
      }

      .skeleton-table-row:last-child {
        border-bottom: none;
      }

      .skeleton-card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }

      .skeleton-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid var(--border-color);
      }

      .skeleton-detail {
        background: white;
        padding: 32px;
        border-radius: 12px;
        border: 1px solid var(--border-color);
      }
    `}</style>
  );
}
