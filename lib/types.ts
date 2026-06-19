export type TeamMember = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  member_id: string;
  title: string;
  notes: string | null;
  start_at: string;
  end_at: string;
  created_at: string;
};

export type Identity = {
  id: string;
  name: string;
};
