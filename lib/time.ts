import { addDays, format, isSameDay, parse, set } from "date-fns";
import { es } from "date-fns/locale";

export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 21;
export const PIXELS_PER_HOUR = 64;

export function dayRangeBounds(day: Date) {
  const start = set(day, {
    hours: DAY_START_HOUR,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const end = set(day, {
    hours: DAY_END_HOUR,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  return { start, end };
}

export function minutesFromDayStart(date: Date, day: Date): number {
  const { start } = dayRangeBounds(day);
  return (date.getTime() - start.getTime()) / 60000;
}

export function totalDayMinutes(): number {
  return (DAY_END_HOUR - DAY_START_HOUR) * 60;
}

export function hourMarks(): number[] {
  const marks: number[] = [];
  for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) marks.push(h);
  return marks;
}

export function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDayLabel(date: Date): string {
  const label = format(date, "EEEE d 'de' MMMM yyyy", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatTimeLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function formatRange(start: Date, end: Date): string {
  return `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function goToDay(date: Date, deltaDays: number): Date {
  return addDays(date, deltaDays);
}

export function combineDateAndTime(date: Date, time: string): Date {
  const parsed = parse(time, "HH:mm", date);
  return set(date, {
    hours: parsed.getHours(),
    minutes: parsed.getMinutes(),
    seconds: 0,
    milliseconds: 0,
  });
}

export function toTimeInputValue(date: Date): string {
  return format(date, "HH:mm");
}

export function parseDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
