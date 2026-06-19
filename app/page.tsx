"use client";

import { useState } from "react";
import { AppointmentModal, type ModalState } from "@/components/AppointmentModal";
import { DayAgenda } from "@/components/DayAgenda";
import { Header } from "@/components/Header";
import { useIdentity } from "@/components/IdentityProvider";
import { NameGate } from "@/components/NameGate";
import type { Appointment, TeamMember } from "@/lib/types";

export default function Home() {
  const { identity, ready, signOut } = useIdentity();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [modal, setModal] = useState<ModalState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header selectedDate={selectedDate} onChangeDate={setSelectedDate} identity={identity} onSignOut={signOut} />

      <DayAgenda
        selectedDate={selectedDate}
        currentMemberId={identity.id}
        onSelectAppointment={handleSelectAppointment}
        refreshKey={refreshKey}
      />

      <button
        onClick={() => setModal({ mode: "create", defaultDate: selectedDate })}
        className="fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#0F2540] text-2xl font-light text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Nuevo compromiso"
      >
        +
      </button>

      {modal && (
        <AppointmentModal
          state={modal}
          currentMemberId={identity.id}
          onClose={() => setModal(null)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
