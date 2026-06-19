"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { AppointmentModal, type ModalState } from "@/components/AppointmentModal";
import { DayAgenda } from "@/components/DayAgenda";
import { Header, type ViewMode } from "@/components/Header";
import { useIdentity } from "@/components/IdentityProvider";
import { MonthAgenda } from "@/components/MonthAgenda";
import { NameGate } from "@/components/NameGate";
import { supabase } from "@/lib/supabase";
import { WeekAgenda } from "@/components/WeekAgenda";
import {
  formatDayLabel,
  formatMonthLabel,
  formatWeekRangeLabel,
  goToDay,
  goToMonth,
  goToWeek,
  isSameMonthAs,
  isSameWeekAs,
  isToday,
} from "@/lib/time";
import type { Appointment, TeamMember } from "@/lib/types";

export default function Home() {
  const { identity, ready, signOut } = useIdentity();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [modal, setModal] = useState<ModalState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    if (!identity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(false);
      return;
    }
    supabase
      .from("team_members")
      .select("is_admin")
      .eq("id", identity.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(Boolean(data?.is_admin)));
  }, [identity]);

  if (!ready) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!identity) {
    return <NameGate />;
  }

  function handleSelectAppointment(
    appointment: Appointment,
    member: TeamMember,
    isOwner: boolean
  ) {
    if (isOwner) {
      setModal({ mode: "edit", appointment });
    } else {
      setModal({
        mode: "view",
        appointment,
        memberName: member.name,
        memberColor: member.color,
      });
    }
  }

  function handleSelectDay(date: Date) {
    setSelectedDate(date);
    setViewMode("day");
  }

  function handlePrev() {
    if (viewMode === "day") setSelectedDate((d) => goToDay(d, -1));
    else if (viewMode === "week") setSelectedDate((d) => goToWeek(d, -1));
    else setSelectedDate((d) => goToMonth(d, -1));
  }

  function handleNext() {
    if (viewMode === "day") setSelectedDate((d) => goToDay(d, 1));
    else if (viewMode === "week") setSelectedDate((d) => goToWeek(d, 1));
    else setSelectedDate((d) => goToMonth(d, 1));
  }

  const label =
    viewMode === "day"
      ? formatDayLabel(selectedDate)
      : viewMode === "week"
        ? formatWeekRangeLabel(selectedDate)
        : formatMonthLabel(selectedDate);

  const today = new Date();
  const showTodayShortcut =
    viewMode === "day"
      ? !isToday(selectedDate)
      : viewMode === "week"
        ? !isSameWeekAs(today, selectedDate)
        : !isSameMonthAs(today, selectedDate);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        label={label}
        showTodayShortcut={showTodayShortcut}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={() => setSelectedDate(new Date())}
        identity={identity}
        onSignOut={signOut}
        isAdmin={isAdmin}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {viewMode === "day" && (
        <DayAgenda
          selectedDate={selectedDate}
          currentMemberId={identity.id}
          onSelectAppointment={handleSelectAppointment}
          refreshKey={refreshKey}
        />
      )}
      {viewMode === "week" && (
        <WeekAgenda
          selectedDate={selectedDate}
          currentMemberId={identity.id}
          onSelectAppointment={handleSelectAppointment}
          onSelectDay={handleSelectDay}
          refreshKey={refreshKey}
        />
      )}
      {viewMode === "month" && (
        <MonthAgenda selectedDate={selectedDate} onSelectDay={handleSelectDay} refreshKey={refreshKey} />
      )}

      {viewMode === "day" && (
        <button
          onClick={() => setModal({ mode: "create", defaultDate: selectedDate })}
          className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#0F2540] text-2xl font-light text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Nuevo compromiso"
        >
          +
        </button>
      )}

      {modal && (
        <AppointmentModal
          state={modal}
          currentMemberId={identity.id}
          onClose={() => setModal(null)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
