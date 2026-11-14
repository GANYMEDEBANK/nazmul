export type Field = {
  key: string;
  label: string;
  type?: "text" | "area" | "lines" | "image";
  hint?: string;
};

export type SectionSchema = {
  key: string;
  label: string;
  kind: "object" | "list";
  titleKey?: string;
  fields: Field[];
};

const entry = (first: Field, second: Field): Field[] => [
  first,
  second,
  { key: "period", label: "Period" },
  { key: "points", label: "Details", type: "lines", hint: "One point per line." },
  { key: "tech", label: "Technology" },
];

export const schema: SectionSchema[] = [
  {
    key: "profile",
    label: "Profile",
    kind: "object",
    fields: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role", hint: "Small line above the headline." },
      { key: "headline", label: "Headline" },
      { key: "tagline", label: "Tagline", type: "area" },
      { key: "bio", label: "About text", type: "area" },
      { key: "contact", label: "Contact note", type: "area" },
      { key: "location", label: "Location" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone", hint: "Leave empty to hide it." },
      { key: "scholar", label: "Google Scholar link" },
      { key: "github", label: "GitHub link" },
      { key: "linkedin", label: "LinkedIn link" },
      { key: "photo", label: "Profile picture", type: "image", hint: "A portrait works best. JPG, PNG or WebP, up to 5 MB." },
      { key: "cv", label: "CV path", hint: "Filled in by the CV upload below." },
    ],
  },
  {
    key: "focus",
    label: "Research focus",
    kind: "object",
    fields: [
      { key: "statement", label: "Statement", type: "area" },
      { key: "body", label: "Body", type: "area" },
    ],
  },
  {
    key: "pillars",
    label: "Focus areas",
    kind: "list",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title" },
      { key: "text", label: "Text", type: "area" },
    ],
  },
  {
    key: "news",
    label: "News",
    kind: "list",
    titleKey: "text",
    fields: [
      { key: "date", label: "Date", hint: "For example: Jan 2025" },
      { key: "text", label: "Text", type: "area" },
      { key: "link", label: "Link" },
    ],
  },
  {
    key: "research",
    label: "Research",
    kind: "list",
    titleKey: "title",
    fields: [
      ...entry({ key: "title", label: "Title" }, { key: "org", label: "Organisation" }),
      { key: "image", label: "Image (optional)", type: "image", hint: "A diagram or poster. JPG, PNG or WebP, up to 5 MB." },
      { key: "caption", label: "Image caption (optional)" },
    ],
  },
  {
    key: "publications",
    label: "Publications",
    kind: "list",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title", type: "area" },
      { key: "authors", label: "Authors", type: "area", hint: "Your name is highlighted when it matches the profile name." },
      { key: "venue", label: "Venue" },
      { key: "year", label: "Year" },
      { key: "doi", label: "DOI", hint: "For example: 10.1155/acis/6552580" },
      { key: "note", label: "Note" },
    ],
  },
  {
    key: "experience",
    label: "Experience",
    kind: "list",
    titleKey: "role",
    fields: entry({ key: "role", label: "Role" }, { key: "org", label: "Organisation" }),
  },
  {
    key: "education",
    label: "Education",
    kind: "list",
    titleKey: "degree",
    fields: [
      { key: "degree", label: "Degree" },
      { key: "school", label: "School" },
      { key: "period", label: "Period" },
      { key: "points", label: "Details", type: "lines", hint: "One point per line." },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    kind: "list",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title" },
      { key: "text", label: "Description", type: "area" },
      { key: "tech", label: "Technology" },
      { key: "link", label: "Link" },
    ],
  },
  {
    key: "skills",
    label: "Skills",
    kind: "list",
    titleKey: "label",
    fields: [
      { key: "label", label: "Group" },
      { key: "items", label: "Items", type: "area" },
    ],
  },
  {
    key: "awards",
    label: "Awards",
    kind: "list",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title" },
      { key: "year", label: "Year" },
    ],
  },
  {
    key: "activities",
    label: "Activities",
    kind: "list",
    titleKey: "role",
    fields: [
      { key: "role", label: "Role" },
      { key: "org", label: "Organisation" },
      { key: "period", label: "Period" },
    ],
  },
];
