/**
 * =============================================================
 * Backend Configuration — Environment & App Settings
 * =============================================================
 */

import dotenv from "dotenv";
dotenv.config();

export const config = {
  /** Server port */
  port: parseInt(process.env.PORT || "5000", 10),

  /** Node environment */
  nodeEnv: process.env.NODE_ENV || "development",

  /** External notification API base URL */
  notificationApiUrl:
    process.env.NOTIFICATION_API_URL ||
    "http://4.224.186.213/evaluation-service/notifications",

  /** Logging API URL */
  logApiUrl:
    process.env.LOG_API_URL ||
    "http://4.224.186.213/evaluation-service/logs",

  /** Default heap capacity for top-N extraction */
  defaultHeapCapacity: parseInt(process.env.DEFAULT_HEAP_CAPACITY || "100", 10),

  /** Default pagination page size */
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || "20", 10),

  /** Maximum allowed page size */
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || "100", 10),
} as const;
