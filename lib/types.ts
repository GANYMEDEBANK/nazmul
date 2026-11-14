export type Profile = {
  name: string;
  role: string;
  headline: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  photo: string;
  cv: string;
  scholar: string;
  github: string;
  linkedin: string;
  contact: string;
};

export type Entry = {
  title?: string;
  role?: string;
  degree?: string;
  org?: string;
  school?: string;
  period: string;
  points?: string[];
  tech?: string;
  image?: string;
  caption?: string;
};

export type Site = {
  profile: Profile;
  focus: { statement: string; body: string };
  pillars: { title: string; text: string }[];
  news: { date: string; text: string; link: string }[];
  research: Entry[];
  publications: {
    title: string;
    authors: string;
    venue: string;
    year: string;
    doi: string;
    note: string;
  }[];
  experience: Entry[];
  education: Entry[];
  projects: { title: string; tech: string; text: string; link: string }[];
  skills: { label: string; items: string }[];
  awards: { title: string; year: string }[];
  activities: { role: string; org: string; period: string }[];
};
