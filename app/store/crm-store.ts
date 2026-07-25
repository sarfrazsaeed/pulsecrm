import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Contact, ContactDraft, PipelineStage } from "../types/crm";

interface CRMState {
  contacts: Contact[];
  lastUpdated: string;
  addContact: (draft: ContactDraft) => void;
  updateContactStage: (id: string, stage: PipelineStage) => void;
  getContactsByStage: (stage: PipelineStage) => Contact[];
  getContactCount: () => number;
  getDealValueByStage: () => Array<{ stage: PipelineStage; total: number }>;
  getDealsCreatedPerMonth: () => Array<{ month: string; count: number }>;
}

const initialContacts: Contact[] = [
  {
    id: "contact-1",
    name: "Ava Patel",
    company: "Northstar Studio",
    email: "ava@northstarstudio.com",
    phone: "555-0101",
    dealValue: 4200,
    stage: "New",
    createdAt: "2026-01-12",
  },
  {
    id: "contact-2",
    name: "Marcus Lee",
    company: "Summit Labs",
    email: "marcus@summitlabs.io",
    phone: "555-0102",
    dealValue: 6800,
    stage: "Contacted",
    createdAt: "2026-01-18",
  },
  {
    id: "contact-3",
    name: "Jules Carter",
    company: "Bright Harbor",
    email: "jules@brightharbor.co",
    phone: "555-0103",
    dealValue: 3100,
    stage: "Proposal",
    createdAt: "2026-02-04",
  },
  {
    id: "contact-4",
    name: "Nina Alvarez",
    company: "Pine & Pixel",
    email: "nina@pinepixel.com",
    phone: "555-0104",
    dealValue: 5400,
    stage: "Won",
    createdAt: "2026-02-14",
  },
  {
    id: "contact-5",
    name: "Samir Khan",
    company: "Anchor Works",
    email: "samir@anchorworks.dev",
    phone: "555-0105",
    dealValue: 2600,
    stage: "Lost",
    createdAt: "2026-03-02",
  },
  {
    id: "contact-6",
    name: "Priya Singh",
    company: "Lumen Collective",
    email: "priya@lumencollective.com",
    phone: "555-0106",
    dealValue: 7900,
    stage: "Contacted",
    createdAt: "2026-03-19",
  },
  {
    id: "contact-7",
    name: "Owen Brooks",
    company: "Cinder & Co",
    email: "owen@cinderco.com",
    phone: "555-0107",
    dealValue: 3600,
    stage: "New",
    createdAt: "2026-04-07",
  },
  {
    id: "contact-8",
    name: "Elena Ruiz",
    company: "Mosaic Advisory",
    email: "elena@mosaicadvisory.com",
    phone: "555-0108",
    dealValue: 6100,
    stage: "Proposal",
    createdAt: "2026-04-23",
  },
  {
    id: "contact-9",
    name: "Theo Grant",
    company: "Cedar & Oak",
    email: "theo@cedaroak.com",
    phone: "555-0109",
    dealValue: 4700,
    stage: "Won",
    createdAt: "2026-05-11",
  },
  {
    id: "contact-10",
    name: "Mina Hassan",
    company: "Blue Harbor Media",
    email: "mina@blueharbormedia.com",
    phone: "555-0110",
    dealValue: 2900,
    stage: "New",
    createdAt: "2026-05-24",
  },
];

const pipelineStages: PipelineStage[] = ["New", "Contacted", "Proposal", "Won", "Lost"];

export const useCRMStore = create<CRMState>()(
  persist(
    devtools((set, get) => ({
      contacts: initialContacts,
      lastUpdated: new Date().toISOString(),
      addContact: (draft) => {
        const newContact: Contact = {
          id: `contact-${Date.now()}`,
          ...draft,
          createdAt: new Date().toISOString().slice(0, 10),
        };

        set((state) => ({
          contacts: [newContact, ...state.contacts],
          lastUpdated: new Date().toISOString(),
        }));
      },
      updateContactStage: (id, stage) => {
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id ? { ...contact, stage } : contact,
          ),
          lastUpdated: new Date().toISOString(),
        }));
      },
      getContactsByStage: (stage) => get().contacts.filter((contact) => contact.stage === stage),
      getContactCount: () => get().contacts.length,
      getDealValueByStage: () =>
        pipelineStages.map((stage) => ({
          stage,
          total: get()
            .contacts.filter((contact) => contact.stage === stage)
            .reduce((sum, contact) => sum + contact.dealValue, 0),
        })),
      getDealsCreatedPerMonth: () => {
        const monthlyCounts = new Map<string, number>();

        get().contacts.forEach((contact) => {
          const month = contact.createdAt.slice(0, 7);
          monthlyCounts.set(month, (monthlyCounts.get(month) ?? 0) + 1);
        });

        return Array.from(monthlyCounts.entries())
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([month, count]) => ({ month, count }));
      },
    })),
    {
      name: 'pulsecrm-storage',
      partialize: (state) => ({ contacts: state.contacts, lastUpdated: state.lastUpdated }),
    }
  )
);
