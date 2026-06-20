"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  PIXELS_PER_HOUR,
  dayRangeBounds,
  formatTimeLabel,
  hourMarks,
  isToday,
  minutesFromDayStart,
  totalDayMinutes,
} from "@/lib/time";
import type { Appointment, TeamMember } from "@/lib/types";

const GUTTER_WIDTH = 56;
const COLUMN_WIDTH = 168;
// Room above the first hour mark so its label (vertically centered on the
// gridline via -translate-y-1/2) isn't clipped by the scroll container's top edge.
const TOP_PADDING = 10;
// Small visual gap between back-to-back appointments, matching the spacing already used in WeekAgenda.
const APPOINTMENT_GAP = 1;

type Props = {
  selectedDate: Date;
  currentMemberId: string;
  onSelectAppointment: (appointment: Appointment, member: TeamMember, isOwner: boolean) => void;
  refreshKey: number;
};

export function DayAgenda({
  selectedDate,
  currentMemberId,
  onSelectAppointment,
  refreshKey,
}: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });
    if (data) setMembers(data);
  }, []);

  const loadAppointments = useCallback(async () => {
    const { start, end } = dayRangeBounds(selectedDate);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .lt("start_at", end.toISOString())
      .gt("end_at", start.toISOString())
      .order("start_at", { ascending: true });
    if (data) setAppointments(data);
  }, [selectedDate]);

  useEffect(() => {
    // Show the loading state immediately when the day or refresh key
    // changes, before the async fetch below resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([loadMembers(), loadAppointments()]).finally(() => setLoading(false));
  }, [loadMembers, loadAppointments, refreshKey]);

  useEffect(() => {
    const channel = supabase
      .channel("agenda-kycn-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        loadAppointments();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "team_members" }, () => {
        loadMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAppointments, loadMembers]);

  const totalHeight = (totalDayMinutes() / 60) * PIXELS_PER_HOUR;
  const marks = hourMarks();
  const showNowLine = isToday(selectedDate);
  const nowTop = showNowLine
    ? (minutesFromDayStart(new Date(), selectedDate) / 60) * PIXELS_PER_HOUR
    : null;

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Cargando agenda…</div>;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div
        className="relative flex"
        style={{ minWidth: GUTTER_WIDTH + members.length * COLUMN_WIDTH }}
      >
        <div
          className="sticky left-0 z-20 flex-shrink-0 bg-white"
          style={{ width: GUTTER_WIDTH }}
        >
          <div className="sticky top-0 z-10 h-11 bg-white" />
          <div className="relative" style={{ height: totalHeight + TOP_PADDING }}>
            {marks.map((h) => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-slate-400"
                style={{ top: (h - marks[0]) * PIXELS_PER_HOUR + TOP_PADDING }}
              >
                {formatTimeLabel(h)}
              </div>
            ))}
          </div>
        </div>

        {members.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-400">
            Todavía no hay nadie en el equipo.
          </div>
        ) : (
          <>
            {showNowLine && nowTop !== null && nowTop >= 0 && nowTop <= totalHeight && (
              <div
                className="pointer-events-none absolute z-10 border-t-2 border-red-400"
                style={{ top: 44 + nowTop + TOP_PADDING, left: GUTTER_WIDTH, right: 0 }}
              >
                <span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-400" />
              </div>
            )}

            {members.map((member) => {
              const isMe = member.id === currentMemberId;
              const memberAppointments = appointments.filter((a) => a.member_id === member.id);
              return (
                <div
                  key={member.id}
                  className="flex-shrink-0 border-l border-slate-100 first:border-l-0"
                  style={{ width: COLUMN_WIDTH }}
                >
                  <div className="sticky top-0 z-10 flex h-11 items-center gap-1.5 truncate border-b border-slate-100 bg-white px-2.5">
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="truncate text-xs font-medium text-slate-700">
                      {member.name}
                      {isMe && <span className="text-slate-400"> (tú)</span>}
                    </span>
                  </div>

                  <div className="relative" style={{ height: totalHeight + TOP_PADDING }}>
                    {marks.slice(1, -1).map((h) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-slate-100"
                        style={{ top: (h - marks[0]) * PIXELS_PER_HOUR + TOP_PADDING }}
                      />
                    ))}

                    {memberAppointments.map((appt) => {
                      const start = new Date(appt.start_at);
                      const end = new Date(appt.end_at);
                      const top = Math.max(
                        0,
                        (minutesFromDayStart(start, selectedDate) / 60) * PIXELS_PER_HOUR
                      );
                      const rawHeight =
                        ((end.getTime() - start.getTime()) / 60000 / 60) * PIXELS_PER_HOUR;
                      const height = Math.max(24, Math.min(rawHeight, totalHeight - top));
                      const isOwner = member.id === currentMemberId;

                      return (
                        <button
                          key={appt.id}
                          onClick={() => onSelectAppointment(appt, member, isOwner)}
                          className="absolute left-1 right-1 overflow-hidden rounded-md px-2 py-1 text-left text-[11px] leading-tight text-white shadow-sm transition-opacity hover:opacity-90"
                          style={{
                            top: top + TOP_PADDING,
                            height: Math.max(20, height - APPOINTMENT_GAP),
                            backgroundColor: member.color,
                          }}
                        >
                          <div className="truncate font-medium">{appt.title}</div>
                          <div className="truncate text-white/80">
                            {start.getHours().toString().padStart(2, "0")}:
                            {start.getMinutes().toString().padStart(2, "0")}–
                            {end.getHours().toString().padStart(2, "0")}:
                            {end.getMinutes().toString().padStart(2, "0")}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
