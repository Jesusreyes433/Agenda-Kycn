"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  formatWeekdayShort,
  isSameMonthAs,
  isToday,
  monthGridDays,
  monthGridRangeBounds,
  weekDays,
} from "@/lib/time";
import type { Appointment, TeamMember } from "@/lib/types";

type Props = {
  selectedDate: Date;
  onSelectDay: (date: Date) => void;
  refreshKey: number;
};

const MAX_DOTS = 4;

export function MonthAgenda({ selectedDate, onSelectDay, refreshKey }: Props) {
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
    const { start, end } = monthGridRangeBounds(selectedDate);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .lt("start_at", end.toISOString())
      .gt("end_at", start.toISOString())
      .order("start_at", { ascending: true });
    if (data) setAppointments(data);
  }, [selectedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([loadMembers(), loadAppointments()]).finally(() => setLoading(false));
  }, [loadMembers, loadAppointments, refreshKey]);

  useEffect(() => {
    const channel = supabase
      .channel("agenda-kycn-month-changes")
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

  const days = monthGridDays(selectedDate);
  const weekdayLabels = weekDays(selectedDate).map(formatWeekdayShort);
  const membersById = new Map(members.map((m) => [m.id, m]));

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        Cargando mes…
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-slate-400">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-1.5">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayAppointments = appointments.filter(
            (a) => new Date(a.start_at).toDateString() === day.toDateString()
          );
          const memberColors = Array.from(
            new Set(dayAppointments.map((a) => a.member_id))
          )
            .map((id) => membersById.get(id)?.color)
            .filter((c): c is string => Boolean(c));

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={`flex min-h-[64px] flex-col items-center gap-1 rounded-lg border border-transparent px-1 py-1.5 hover:border-slate-200 hover:bg-slate-50 ${
                isSameMonthAs(day, selectedDate) ? "" : "opacity-35"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday(day) ? "bg-[#0F2540] text-white" : "text-slate-700"
                }`}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-0.5">
                {memberColors.slice(0, MAX_DOTS).map((color, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {memberColors.length > MAX_DOTS && (
                  <span className="text-[9px] text-slate-400">
                    +{memberColors.length - MAX_DOTS}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
