"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatWeekdayShort, isToday, weekDays, weekRangeBounds } from "@/lib/time";
import type { Appointment, TeamMember } from "@/lib/types";

type Props = {
  selectedDate: Date;
  currentMemberId: string;
  onSelectAppointment: (appointment: Appointment, member: TeamMember, isOwner: boolean) => void;
  onSelectDay: (date: Date) => void;
  refreshKey: number;
};

export function WeekAgenda({
  selectedDate,
  currentMemberId,
  onSelectAppointment,
  onSelectDay,
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
    const { start, end } = weekRangeBounds(selectedDate);
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
      .channel("agenda-kycn-week-changes")
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

  const days = weekDays(selectedDate);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        Cargando semana…
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-slate-400">
        Todavía no hay nadie en el equipo.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[90px_repeat(7,1fr)] border-b border-slate-200">
          <div />
          {days.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={`flex flex-col items-center gap-0.5 border-l border-slate-100 px-1 py-2 hover:bg-slate-50 ${
                isToday(day) ? "bg-[#0F2540]/5" : ""
              }`}
            >
              <span className="text-[11px] font-medium text-slate-400">
                {formatWeekdayShort(day)}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday(day) ? "bg-[#0F2540] text-white" : "text-slate-700"
                }`}
              >
                {day.getDate()}
              </span>
            </button>
          ))}
        </div>

        {members.map((member) => (
          <div key={member.id} className="grid grid-cols-[90px_repeat(7,1fr)] border-b border-slate-100">
            <div className="flex min-w-0 items-center gap-1.5 px-2.5 py-2">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              <span className="truncate text-xs font-medium text-slate-700">
                {member.name}
                {member.id === currentMemberId && <span className="text-slate-400"> (tú)</span>}
              </span>
            </div>

            {days.map((day) => {
              const dayAppointments = appointments.filter(
                (a) =>
                  a.member_id === member.id &&
                  new Date(a.start_at).toDateString() === day.toDateString()
              );
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[44px] min-w-0 space-y-1 border-l border-slate-100 p-1 ${
                    isToday(day) ? "bg-[#0F2540]/5" : ""
                  }`}
                >
                  {dayAppointments.map((appt) => {
                    const isOwner = member.id === currentMemberId;
                    const start = new Date(appt.start_at);
                    return (
                      <button
                        key={appt.id}
                        onClick={() => onSelectAppointment(appt, member, isOwner)}
                        className="block w-full min-w-0 truncate rounded px-1.5 py-1 text-left text-[10px] font-medium text-white"
                        style={{ backgroundColor: member.color }}
                        title={appt.title}
                      >
                        {start.getHours().toString().padStart(2, "0")}:
                        {start.getMinutes().toString().padStart(2, "0")} {appt.title}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
