import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  parse,
  set,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 21;
export const PIXELS_PER_HOUR = 64;
const WEEK_STARTS_ON = 1; // lunes

function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

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
  return capitalizeFirst(format(date, "EEEE d 'de' MMMM yyyy", { locale: es }));
}

export function formatWeekdayShort(date: Date): string {
  return capitalizeFirst(format(date, "EEE", { locale: es })).replace(".", "");
}

export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
  return eachDayOfInterval({ start, end });
}

export function formatWeekRangeLabel(date: Date): string {
  const days = weekDays(date);
  const start = days[0];
  const end = days[days.length - 1];
  const sameMonth = isSameMonth(start, end);
  const startLabel = format(start, sameMonth ? "d" : "d MMM", { locale: es });
  const endLabel = format(end, "d 'de' MMMM yyyy", { locale: es });
  return capitalizeFirst(`${startLabel} – ${endLabel}`);
}

export function goToWeek(date: Date, deltaWeeks: number): Date {
  return addWeeks(date, deltaWeeks);
}

export function isSameWeekAs(date: Date, reference: Date): boolean {
  return isSameWeek(date, reference, { weekStartsOn: WEEK_STARTS_ON });
}

export function weekRangeBounds(date: Date) {
  const days = weekDays(date);
  return { start: startOfDay(days[0]), end: endOfDay(days[days.length - 1]) };
}

export function monthGridDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: WEEK_STARTS_ON });
  return eachDayOfInterval({ start, end });
}

export function monthGridRangeBounds(date: Date) {
  const days = monthGridDays(date);
  return { start: startOfDay(days[0]), end: endOfDay(days[days.length - 1]) };
}

export function isSameMonthAs(date: Date, reference: Date): boolean {
  return isSameMonth(date, reference);
}

export function formatMonthLabel(date: Date): string {
  return capitalizeFirst(format(date, "MMMM yyyy", { locale: es }));
}

export function goToMonth(date: Date, deltaMonths: number): Date {
  return addMonths(date, deltaMonths);
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
