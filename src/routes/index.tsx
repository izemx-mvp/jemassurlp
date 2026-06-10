import { useState, useEffect, useRef, useCallback } from "react";
import logoAsset from "@/assets/jemassur-logo.png.asset.json";
import {
  Phone, MessageCircle, Calendar, Shield, Clock, Users, CheckCircle2,
  Sparkles, Send, X, Bot, Bell, ChevronRight, MapPin, Star, Zap,
  Lock, HeartHandshake, ArrowRight, Headphones, FileCheck, UserCheck,
  Eye, EyeOff, Mail, Briefcase, Plane, Home, Car, Stethoscope,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

// ---------------- Types ----------------
type Lead = {
  id: string;
  name: string;
  phone: string;
  insurance: string;
  city: string;
  availability: string;
  source: string;
  status: "Nouveau" | "Contacté" | "RDV planifié";
  notified: boolean;
  appointment?: string;
  createdAt: string;
};

type Notif = {
  id: string;
  title: string;
  body: string;
  icon: "lead" | "phone" | "car" | "calendar" | "agent";
};

type ChatMsg = { id: string; from: "bot" | "user"; text: string };

const INSURANCES = [
  { value: "Assurance auto", icon: Car },
  { value: "Assurance habitation", icon: Home },
  { value: "Assurance santé", icon: Stethoscope },
  { value: "Assurance professionnelle", icon: Briefcase },
  { value: "Assurance voyage", icon: Plane },
  { value: "Autre besoin", icon: Sparkles },
];

const AD_SOURCES = ["Facebook Ads", "Instagram Ads", "Google Ads", "TikTok Ads"];

const SEED_LEADS: Lead[] = [
  { id: "l1", name: "Sophie Martin", phone: "06 12 34 56 78", insurance: "Assurance auto", city: "Lyon", availability: "Aujourd'hui 14h-18h", source: "Facebook Ads", status: "RDV planifié", notified: true, appointment: "Demain 10:00", createdAt: "Il y a 4 min" },
  { id: "l2", name: "Karim Benali", phone: "07 88 22 14 09", insurance: "Assurance habitation", city: "Paris", availability: "Demain matin", source: "Google Ads", status: "Contacté", notified: true, createdAt: "Il y a 12 min" },
  { id: "l3", name: "Aïcha Diallo", phone: "06 45 78 11 02", insurance: "Assurance santé", city: "Marseille", availability: "Ce soir 18h-20h", source: "Instagram Ads", status: "Nouveau", notified: true, createdAt: "Il y a 23 min" },
];

// ---------------- Notifications ----------------
function useNotifications() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const push = useCallback((n: Omit<Notif, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setNotifs((p) => [...p, { ...n, id }]);
    setTimeout(() => setNotifs((p) => p.filter((x) => x.id !== id)), 5500);
  }, []);
  return { notifs, push };
}

function NotifIcon({ type }: { type: Notif["icon"] }) {
  const Icon = type === "lead" ? Bell : type === "phone" ? Phone : type === "car" ? Car : type === "calendar" ? Calendar : UserCheck;
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-telegram/15 text-telegram">
      <Icon className="h-4 w-4" />
    </div>
  );
}

function TelegramToasts({ notifs }: { notifs: Notif[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[90vw] max-w-sm flex-col gap-2">
      {notifs.map((n) => (
        <div key={n.id} className="animate-slide-in-right pointer-events-auto rounded-2xl border border-border bg-card shadow-elevated">
          <div className="flex items-start gap-3 p-3">
            <NotifIcon type={n.icon} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-telegram">Telegram</span>
                <span className="text-[10px] text-muted-foreground">• à l'instant</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Lead Form ----------------
function LeadForm({ onLead, compact = false }: { onLead: (l: Lead) => void; compact?: boolean }) {
  const [form, setForm] = useState({ name: "", phone: "", insurance: "Assurance auto", city: "", availability: "Aujourd'hui après-midi" });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const lead: Lead = {
      id: Math.random().toString(36).slice(2),
      ...form,
      source: AD_SOURCES[Math.floor(Math.random() * AD_SOURCES.length)],
      status: "Nouveau",
      notified: true,
      createdAt: "à l'instant",
    };
    onLead(lead);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-slide-up rounded-3xl border border-success/30 bg-success/5 p-6 text-center sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-navy">Merci 👋 Votre demande a bien été reçue</h3>
        <p className="mt-2 text-sm text-muted-foreground">Un conseiller Jemassur vous contactera rapidement.</p>
        <button onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", insurance: "Assurance auto", city: "", availability: "Aujourd'hui après-midi" }); }} className="mt-5 text-sm font-semibold text-primary hover:underline">
          Faire une nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`rounded-3xl border border-border bg-card p-5 shadow-elevated sm:p-6 ${compact ? "" : ""}`}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Phone className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-navy">Être rappelé gratuitement</h3>
          <p className="text-xs text-muted-foreground">Réponse rapide d'un conseiller</p>
        </div>
      </div>
      <div className="grid gap-3">
        <Field label="Nom complet">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Jean Dupont" />
        </Field>
        <Field label="Numéro de téléphone">
          <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="06 12 34 56 78" />
        </Field>
        <Field label="Type d'assurance">
          <select value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} className="input">
            {INSURANCES.map((i) => <option key={i.value}>{i.value}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ville">
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" placeholder="Paris" />
          </Field>
          <Field label="Disponibilité">
            <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="input">
              <option>Aujourd'hui matin</option>
              <option>Aujourd'hui après-midi</option>
              <option>Aujourd'hui soir</option>
              <option>Demain</option>
              <option>Cette semaine</option>
            </select>
          </Field>
        </div>
      </div>
      <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-glow px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-glow-primary transition hover:opacity-95">
        Demander mon rappel <ArrowRight className="h-4 w-4" />
      </button>
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3" /> Vos informations restent confidentielles
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}

// ---------------- Chatbot ----------------
type ChatStep = "ask_type" | "ask_phone" | "ask_appointment" | "done";

function Chatbot({ onLead, pushNotif }: { onLead: (l: Lead) => void; pushNotif: (n: Omit<Notif, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<ChatStep>("ask_type");
  const [input, setInput] = useState("");
  const [data, setData] = useState<{ insurance?: string; phone?: string; appointment?: string }>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 4500);
    return () => clearTimeout(t);
  }, []);

  const addBot = useCallback((text: string, delay = 700) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: Math.random().toString(36).slice(2), from: "bot", text }]);
      setTyping(false);
    }, delay);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      addBot("Bonjour 👋 Je suis l'assistant Jemassur. Quel type d'assurance recherchez-vous ?", 500);
    }
  }, [open, messages.length, addBot]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Math.random().toString(36).slice(2), from: "user", text }]);
    setInput("");

    if (step === "ask_type") {
      setData((d) => ({ ...d, insurance: text }));
      setStep("ask_phone");
      addBot(`Parfait, ${text.toLowerCase()} ✅`, 600);
      setTimeout(() => addBot("Je peux vous faire rappeler rapidement par un conseiller. Pouvez-vous me communiquer votre numéro ?", 1400), 800);
    } else if (step === "ask_phone") {
      setData((d) => ({ ...d, phone: text }));
      setStep("ask_appointment");
      pushNotif({ title: "Téléphone récupéré", body: `Lead chatbot — ${text}`, icon: "phone" });
      addBot("Merci ! Souhaitez-vous planifier un rendez-vous avec un conseiller ?", 700);
    } else if (step === "ask_appointment") {
      setData((d) => ({ ...d, appointment: text }));
      setStep("done");
      const lead: Lead = {
        id: Math.random().toString(36).slice(2),
        name: "Lead chatbot",
        phone: data.phone || "—",
        insurance: data.insurance || "Autre besoin",
        city: "—",
        availability: text,
        source: "Chatbot IA",
        status: "RDV planifié",
        notified: true,
        appointment: text,
        createdAt: "à l'instant",
      };
      onLead(lead);
      addBot("Parfait 🎉 Un conseiller vous contactera selon votre disponibilité. À très vite !", 800);
      setTimeout(() => pushNotif({ title: "Rendez-vous réservé via chatbot", body: text, icon: "calendar" }), 1200);
    }
  };

  const quickReplies =
    step === "ask_type" ? ["Assurance auto", "Habitation", "Santé", "Pro"] :
    step === "ask_appointment" ? ["Demain matin", "Demain après-midi", "Cette semaine"] :
    [];

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elevated animate-pulse-ring">
          <Bot className="h-5 w-5" /> Assistant IA
        </button>
      )}
      {open && (
        <div className="animate-slide-up fixed bottom-4 right-4 z-40 flex h-[560px] max-h-[85vh] w-[92vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
          <div className="flex items-center justify-between bg-navy px-4 py-3 text-navy-foreground">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <Bot className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy bg-success" />
              </div>
              <div>
                <p className="text-sm font-bold">Assistant Jemassur</p>
                <p className="text-[11px] text-navy-foreground/70">En ligne · IA conversationnelle</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-navy-foreground/70 hover:text-navy-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-soft-gradient p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.from === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm border border-border bg-card text-foreground"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-primary" style={{ animation: `typing 1.2s ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {quickReplies.length > 0 && !typing && (
            <div className="flex flex-wrap gap-1.5 border-t border-border bg-card px-3 py-2">
              {quickReplies.map((q) => (
                <button key={q} onClick={() => send(q)} className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10">
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-border bg-card p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={step === "done"}
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              placeholder={step === "done" ? "Conversation terminée ✓" : "Écrire un message..."}
            />
            <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50" disabled={!input.trim() || step === "done"}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// ---------------- Admin Panel ----------------
function AdminPanel({ leads, open, onClose }: { leads: Lead[]; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="animate-slide-up flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-elevated sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border bg-navy px-5 py-4 text-navy-foreground">
          <div>
            <p className="text-xs uppercase tracking-widest text-navy-foreground/60">Démo admin</p>
            <h3 className="text-lg font-bold">Leads reçus ({leads.length})</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-auto p-4 sm:p-5">
          <div className="hidden grid-cols-7 gap-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
            <span>Nom</span><span>Téléphone</span><span>Assurance</span><span>Source</span><span>Statut</span><span>Telegram</span><span>RDV</span>
          </div>
          <div className="divide-y divide-border">
            {leads.map((l) => (
              <div key={l.id} className="grid grid-cols-1 gap-2 py-3 text-sm sm:grid-cols-7 sm:items-center sm:gap-3">
                <div>
                  <p className="font-semibold text-navy">{l.name}</p>
                  <p className="text-xs text-muted-foreground sm:hidden">{l.createdAt}</p>
                </div>
                <span className="font-mono text-xs text-foreground">{l.phone}</span>
                <span className="text-xs text-foreground">{l.insurance}</span>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">{l.source}</span>
                <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${l.status === "Nouveau" ? "bg-primary/10 text-primary" : l.status === "Contacté" ? "bg-amber-500/10 text-amber-700" : "bg-success/15 text-success"}`}>
                  {l.status}
                </span>
                <span className="inline-flex w-fit items-center gap-1 text-xs text-telegram"><Bell className="h-3 w-3" /> Notifié</span>
                <span className="text-xs text-muted-foreground">{l.appointment || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Appointment Picker ----------------
function AppointmentPicker({ onBook }: { onBook: (slot: string, advisor: string) => void }) {
  const slots = ["09:00", "10:30", "11:00", "14:00", "15:30", "17:00"];
  const advisors = ["Camille L.", "Yassine B.", "Maya R."];
  const [slot, setSlot] = useState<string | null>(null);
  const [advisor, setAdvisor] = useState(advisors[0]);
  const [booked, setBooked] = useState<string | null>(null);

  const confirm = () => {
    if (!slot) return;
    const txt = `Demain ${slot} avec ${advisor}`;
    setBooked(txt);
    onBook(txt, advisor);
  };

  if (booked) {
    return (
      <div className="rounded-3xl border border-success/30 bg-success/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h4 className="mt-3 text-lg font-bold text-navy">Rendez-vous confirmé</h4>
        <p className="mt-1 text-sm text-muted-foreground">{booked}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-foreground"><Calendar className="h-3 w-3 text-primary" /> Synchronisé avec Google Calendar</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-navy">Choisir un créneau</h4>
          <p className="text-xs text-muted-foreground">Demain · disponibilités en direct</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[11px] font-semibold text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Live</span>
      </div>
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold text-navy">Conseiller</p>
        <div className="flex flex-wrap gap-2">
          {advisors.map((a) => (
            <button key={a} onClick={() => setAdvisor(a)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${advisor === a ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary/40"}`}>{a}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-navy">Créneaux</p>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${slot === s ? "border-primary bg-primary text-primary-foreground shadow-glow-primary" : "border-border bg-background text-foreground hover:border-primary/40"}`}>{s}</button>
          ))}
        </div>
      </div>
      <button onClick={confirm} disabled={!slot} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-bold text-navy-foreground disabled:opacity-50">
        Confirmer le rendez-vous <Calendar className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------- Page ----------------
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jemassur — Échangez avec un conseiller assurance" },
      { name: "description", content: "Obtenez rapidement une orientation personnalisée et un rappel d'un conseiller Jemassur. Auto, habitation, santé, pro, voyage." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [adminOpen, setAdminOpen] = useState(false);
  const { notifs, push } = useNotifications();

  const handleLead = (lead: Lead) => {
    setLeads((p) => [lead, ...p]);
    push({ title: "Nouveau lead reçu", body: `${lead.source} • ${lead.insurance}`, icon: "lead" });
    setTimeout(() => push({ title: lead.insurance + " demandée", body: `Ville : ${lead.city || "—"} • Disponibilité : ${lead.availability}`, icon: "car" }), 1500);
    setTimeout(() => push({ title: "Conseiller notifié", body: "Un conseiller va rappeler ce contact.", icon: "agent" }), 3000);
  };

  const bookAppointment = (slot: string, advisor: string) => {
    push({ title: "Rendez-vous réservé", body: `${slot} avec ${advisor}`, icon: "calendar" });
    const lead: Lead = {
      id: Math.random().toString(36).slice(2),
      name: "Prospect RDV",
      phone: "—",
      insurance: "Assurance auto",
      city: "—",
      availability: slot,
      source: "Page RDV",
      status: "RDV planifié",
      notified: true,
      appointment: slot,
      createdAt: "à l'instant",
    };
    setLeads((p) => [lead, ...p]);
  };

  // Periodic ambient notifications
  useEffect(() => {
    const samples: Omit<Notif, "id">[] = [
      { title: "Nouveau lead depuis Ads", body: "Facebook Ads • Assurance auto", icon: "lead" },
      { title: "Téléphone récupéré", body: "Lead chatbot • +33 6 88 ••", icon: "phone" },
      { title: "Rendez-vous réservé", body: "Demain 11:00 avec Camille L.", icon: "calendar" },
    ];
    let i = 0;
    const t = setInterval(() => { push(samples[i % samples.length]); i++; }, 14000);
    return () => clearInterval(t);
  }, [push]);

  return (
    <div className="min-h-screen bg-background">
      <TelegramToasts notifs={notifs} />
      <AdminPanel leads={leads} open={adminOpen} onClose={() => setAdminOpen(false)} />
      <Chatbot onLead={handleLead} pushNotif={push} />

      {/* Disclaimer ribbon */}
      <div className="bg-navy/95 px-4 py-1.5 text-center text-[11px] font-medium text-navy-foreground/80">
        Prototype de démonstration – Version non contractuelle
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="Jemassur" className="h-9 w-auto" />
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-navy md:flex">
            <a href="#workflow" className="hover:text-primary">Fonctionnement</a>
            <a href="#avantages" className="hover:text-primary">Avantages</a>
            <a href="#rdv" className="hover:text-primary">Rendez-vous</a>
            <a href="#avis" className="hover:text-primary">Avis</a>
          </nav>
          <a href="#lead" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft hover:opacity-95 sm:text-sm">
            <Phone className="h-3.5 w-3.5" /> Être rappelé
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden bg-hero-gradient">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="text-navy-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
              Assurance accompagnée par IA
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Besoin d'une assurance adaptée ? <span className="bg-gradient-to-r from-primary-glow to-white bg-clip-text text-transparent">Échangez avec un conseiller Jemassur</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-navy-foreground/80 sm:text-lg">
              Obtenez rapidement une orientation personnalisée, une réponse adaptée à votre besoin et un rappel par un conseiller.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#lead" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-glow px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-glow-primary transition hover:opacity-95">
                <Phone className="h-4 w-4" /> Être rappelé
              </a>
              <button onClick={() => document.querySelector<HTMLButtonElement>("[data-chat-trigger]")?.click()} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/15">
                <MessageCircle className="h-4 w-4" /> Discuter avec l'assistant IA
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { icon: Zap, label: "Réponse rapide" },
                { icon: Headphones, label: "Conseiller dispo" },
                { icon: HeartHandshake, label: "Accompagnement perso" },
                { icon: Calendar, label: "RDV simple" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-white backdrop-blur">
                  <Icon className="h-4 w-4 text-primary-glow" /> {label}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-navy-foreground/70">
              <div className="flex -space-x-2">
                {["A", "M", "K", "S"].map((c, i) => (
                  <div key={c} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-navy bg-gradient-to-br from-primary to-primary-glow text-[10px] font-bold text-white" style={{ zIndex: 10 - i }}>{c}</div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                <span className="ml-1.5">4.9/5 · clients accompagnés</span>
              </div>
            </div>
          </div>

          <div id="lead" className="relative">
            {/* Chatbot preview card */}
            <div className="absolute -left-4 -top-4 hidden w-56 rotate-[-4deg] rounded-2xl border border-white/20 bg-white/95 p-3 shadow-elevated lg:block animate-float">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white"><Bot className="h-3.5 w-3.5" /></div>
                <p className="text-xs font-bold text-navy">Assistant IA</p>
              </div>
              <p className="mt-2 text-[11px] text-foreground">Bonjour 👋 Quel type d'assurance recherchez-vous ?</p>
            </div>
            <LeadForm onLead={handleLead} />
            <button data-chat-trigger onClick={() => document.querySelector<HTMLButtonElement>("[data-chat-trigger]")?.scrollIntoView()} className="hidden" />
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="bg-soft-gradient px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Comment ça marche</span>
            <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">Un parcours simple, rapide et accompagné</h2>
            <p className="mt-3 text-muted-foreground">De la publicité au rappel par un conseiller, en six étapes fluides.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Sparkles, t: "Vous arrivez depuis une publicité", d: "Facebook, Instagram, Google : un seul clic suffit." },
              { icon: FileCheck, t: "Vous indiquez votre besoin", d: "Type d'assurance, ville et disponibilité." },
              { icon: Bot, t: "L'IA vous oriente et qualifie", d: "L'assistant Jemassur précise votre demande." },
              { icon: Bell, t: "Un conseiller est notifié", d: "Notification instantanée à l'équipe via Telegram." },
              { icon: Phone, t: "Vous êtes rappelé rapidement", d: "Selon le créneau que vous avez choisi." },
              { icon: Calendar, t: "Ou vous prenez un rendez-vous", d: "Réservez un créneau directement en ligne." },
            ].map(({ icon: Icon, t, d }, i) => (
              <div key={t} className="group relative rounded-3xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-elevated">
                <span className="absolute right-5 top-5 text-3xl font-extrabold text-primary/10">0{i+1}</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-white shadow-soft">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-navy">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section id="avantages" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Avantages</span>
              <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">Une assurance pensée pour vous faire gagner du temps</h2>
              <p className="mt-4 text-muted-foreground">Vos demandes sont traitées en priorité, même hors horaires de bureau, grâce à notre assistant IA et notre équipe dédiée.</p>
              <a href="#lead" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Demander un rappel <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Zap, t: "Réponse rapide", d: "Premier contact en quelques minutes." },
                { icon: Clock, t: "Gain de temps", d: "Pas de file d'attente ni formulaire interminable." },
                { icon: UserCheck, t: "Orientation adaptée", d: "Solution sur mesure selon votre profil." },
                { icon: Headphones, t: "Conseiller disponible", d: "Une vraie personne, pas un robot seul." },
                { icon: Calendar, t: "Rendez-vous facile", d: "Réservez un créneau en deux clics." },
                { icon: Shield, t: "Traitement hors horaires", d: "Vos demandes ne sont jamais perdues." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-bold text-navy">{t}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Réassurance */}
      <section className="bg-navy px-4 py-16 text-navy-foreground sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-glow">Confiance & sécurité</span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Vos informations sont protégées</h2>
            <p className="mt-4 text-navy-foreground/75">
              Vos informations sont utilisées uniquement pour vous recontacter dans le cadre de votre demande. Jemassur garantit un accompagnement humain, simple et sécurisé.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Lock, t: "Données chiffrées" },
                { icon: Users, t: "Assistance humaine" },
                { icon: Zap, t: "Traitement prioritaire" },
                { icon: Shield, t: "Confidentialité totale" },
              ].map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold backdrop-blur">
                  <Icon className="h-4 w-4 text-primary-glow" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {INSURANCES.map(({ value, icon: Icon }) => (
              <div key={value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary-glow"><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-bold">{value}</p>
                  <p className="text-[11px] text-navy-foreground/60">Accompagnement personnalisé</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rendez-vous */}
      <section id="rdv" className="bg-soft-gradient px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Rendez-vous</span>
            <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">Prenez rendez-vous en quelques secondes</h2>
            <p className="mt-4 text-muted-foreground">Choisissez votre conseiller, sélectionnez un créneau et recevez une confirmation immédiate. Synchronisation Google Calendar incluse.</p>
            <ul className="mt-5 space-y-2 text-sm text-foreground">
              {["Conseillers experts par domaine", "Visio ou appel téléphonique", "Rappel automatique avant le RDV"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {t}</li>
              ))}
            </ul>
          </div>
          <AppointmentPicker onBook={bookAppointment} />
        </div>
      </section>

      {/* Avis */}
      <section id="avis" className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Ils nous ont fait confiance</span>
            <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">Une expérience saluée par nos clients</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { name: "Marion D.", city: "Bordeaux", text: "Processus très rapide et fluide. J'ai eu un retour en moins de 10 minutes !" },
              { name: "Tarek M.", city: "Lille", text: "J'ai été rappelé rapidement par un conseiller, très à l'écoute de ma situation." },
              { name: "Émilie B.", city: "Nantes", text: "Très pratique pour prendre rendez-vous. Tout s'est fait en deux clics." },
            ].map((t) => (
              <div key={t.name} className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="mt-3 text-sm text-foreground">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-bold text-white">{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-bold text-navy">{t.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-hero-gradient p-8 text-center text-navy-foreground shadow-elevated sm:p-14 relative">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Obtenez rapidement une solution adaptée à votre besoin</h2>
            <p className="mx-auto mt-4 max-w-xl text-navy-foreground/80">Un conseiller Jemassur vous contactera rapidement.</p>
            <a href="#lead" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-navy shadow-glow-primary transition hover:opacity-95">
              <Phone className="h-4 w-4" /> Demander un rappel maintenant
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src={logoAsset.url} alt="Jemassur" className="h-8 w-auto" />
            <p className="mt-3 text-xs text-muted-foreground">Toujours à vos côtés pour vos besoins d'assurance.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> contact@jemassur.fr</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> 01 80 00 00 00</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy">Informations</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Mentions légales</a></li>
              <li><a href="#" className="hover:text-primary">Confidentialité</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy">Démo</p>
            <button onClick={() => setAdminOpen(true)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <Eye className="h-3.5 w-3.5" /> Voir les leads reçus
            </button>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Jemassur. Tous droits réservés.</p>
          <p>Powered by <span className="font-bold text-navy">IZEMX</span></p>
        </div>
      </footer>

      <style>{`
        .input { width: 100%; border-radius: 0.875rem; border: 1px solid var(--input); background: var(--background); padding: 0.625rem 0.875rem; font-size: 0.875rem; outline: none; transition: border-color .15s, box-shadow .15s; }
        .input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px oklch(0.55 0.2 255 / 0.15); }
      `}</style>
    </div>
  );
}
