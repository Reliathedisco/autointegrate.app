import fs from "fs";
import path from "path";
import { TIME_SAVED_MINUTES, getTimeSavedMinutes } from "./config.js";

interface MetricEvent {
  integrationId: string;
  timestamp: string;
}

interface MetricsData {
  events: MetricEvent[];
}

const DATA_FILE = path.join(process.cwd(), "metrics", "data.json");

function loadData(): MetricsData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("[Metrics] Error loading data:", err);
  }
  return { events: [] };
}

function saveData(data: MetricsData): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[Metrics] Error saving data:", err);
  }
}

export function recordIntegration(integrationId: string): void {
  const data = loadData();
  data.events.push({
    integrationId: integrationId.toLowerCase(),
    timestamp: new Date().toISOString(),
  });
  saveData(data);
  console.log(`[Metrics] Recorded integration: ${integrationId}`);
}

export function recordMultipleIntegrations(integrationIds: string[]): void {
  const data = loadData();
  const timestamp = new Date().toISOString();
  for (const id of integrationIds) {
    data.events.push({
      integrationId: id.toLowerCase(),
      timestamp,
    });
  }
  saveData(data);
  console.log(`[Metrics] Recorded ${integrationIds.length} integrations: ${integrationIds.join(", ")}`);
}

export interface PublicStats {
  integrationsThisWeek: number;
  hoursSavedThisMonth: number;
  totalIntegrations: number;
  totalHoursSaved: number;
}

export function getPublicStats(): PublicStats {
  const data = loadData();
  const now = new Date();
  
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  let integrationsThisWeek = 0;
  let minutesSavedThisMonth = 0;
  let totalMinutesSaved = 0;
  
  for (const event of data.events) {
    const eventDate = new Date(event.timestamp);
    const minutesSaved = getTimeSavedMinutes(event.integrationId);
    
    totalMinutesSaved += minutesSaved;
    
    if (eventDate >= oneWeekAgo) {
      integrationsThisWeek++;
    }
    
    if (eventDate >= oneMonthAgo) {
      minutesSavedThisMonth += minutesSaved;
    }
  }
  
  return {
    integrationsThisWeek,
    hoursSavedThisMonth: Math.round((minutesSavedThisMonth / 60) * 10) / 10,
    totalIntegrations: data.events.length,
    totalHoursSaved: Math.round((totalMinutesSaved / 60) * 10) / 10,
  };
}

export function getTimeSavedConfig(): Record<string, number> {
  return { ...TIME_SAVED_MINUTES };
}
