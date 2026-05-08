/** Utility formatters for timestamps and display */

/** Formats ISO/raw timestamp to readable format */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp.replace(" ", "T"));
  if (isNaN(date.getTime())) return timestamp;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Returns relative time string (e.g., "2 hours ago") */
export function getRelativeTime(timestamp: string): string {
  const date = new Date(timestamp.replace(" ", "T"));
  if (isNaN(date.getTime())) return timestamp;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffDay > 30) return formatTimestamp(timestamp);
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHr > 0) return `${diffHr}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "Just now";
}

/** Maps notification type to MUI color */
export function getTypeColor(type: string): "error" | "warning" | "info" | "success" | "default" {
  switch (type) {
    case "Placement": return "success";
    case "Result": return "warning";
    case "Event": return "info";
    default: return "default";
  }
}
