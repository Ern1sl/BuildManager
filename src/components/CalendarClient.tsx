"use client";

import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  startOfDay,
  parseISO,
  isToday,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  X,
  Layers,
  LayoutGrid,
  AlignJustify,
  Trash2,
} from "lucide-react";
import Modal from "./Modal";
import { createEvent, deleteEvent, updateEvent } from "@/lib/actions/events";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import FormError from "./FormError";

const EventSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .required("Please provide a name for this event"),
  category: Yup.string().required("Category is required"),
  time: Yup.string().required("Time is required"),
});

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "project" | "phase" | "manual";
  category?: string;
  color?: string;
  description?: string;
  projectName?: string;
}

interface CalendarClientProps {
  projects: any[];
  manualEvents: any[];
}

export default function CalendarClient({
  projects,
  manualEvents,
}: CalendarClientProps) {
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Process all events into a single timeline
  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = [];

    // 1. Projects Deadlines
    projects.forEach((p) => {
      if (p.deadline) {
        list.push({
          id: `p-${p.id}`,
          title: `Deadline: ${p.name}`,
          date: parseISO(p.deadline),
          type: "project",
          category: "Other",
          color: "bg-[var(--accent-primary)]",
          projectName: p.name,
        });
      }
      p.phases?.forEach((ph: any) => {
        if (ph.deadline) {
          list.push({
            id: `ph-${ph.id}`,
            title: ph.name,
            date: parseISO(ph.deadline),
            type: "phase",
            category: "Other",
            color: "bg-[var(--accent-primary)]",
            projectName: p.name,
          });
        }
      });
    });

    // 2. Manual Events
    manualEvents.forEach((e) => {
      list.push({
        id: e.id,
        title: e.title,
        date: parseISO(e.date),
        type: "manual",
        category: e.category,
        color: "bg-[var(--accent-primary)]",
        description: e.description,
        projectName: e.project?.name,
      });
    });

    return list;
  }, [projects, manualEvents]);

  // Handlers
  const next = () =>
    setCurrentDate(
      view === "month" ? addMonths(currentDate, 1) : addWeeks(currentDate, 1),
    );
  const prev = () =>
    setCurrentDate(
      view === "month" ? subMonths(currentDate, 1) : subWeeks(currentDate, 1),
    );
  const goToToday = () => setCurrentDate(new Date());

  const handleAddEvent = async (values: any, { resetForm }: any) => {
    if (!selectedDay) return;

    // Combine date and time
    const [hours, minutes] = values.time.split(":").map(Number);
    const combinedDate = new Date(selectedDay);
    combinedDate.setHours(hours, minutes);

    setIsSubmitting(true);
    await createEvent({
      title: values.title,
      date: combinedDate,
      category: values.category,
    });
    setIsSubmitting(false);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveEdit = async (values: any) => {
    if (!activeEvent || !values.date) return;

    // Combine date and time
    const [hours, minutes] = values.time.split(":").map(Number);
    const combinedDate = new Date(values.date);
    combinedDate.setHours(hours, minutes);

    setIsSubmitting(true);
    await updateEvent(activeEvent.id, {
      title: values.title,
      category: values.category,
      date: combinedDate,
    });
    setIsSubmitting(false);
    setIsEditMode(false);
    setIsDetailModalOpen(false);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    await deleteEvent(eventToDelete.id);
    setIsDeleting(false);
    setEventToDelete(null);
    setIsDetailModalOpen(false);
  };

  const startEditing = () => {
    if (!activeEvent) return;
    setIsEditMode(true);
  };

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return allEvents
      .filter((e) => isSameDay(e.date, selectedDay))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [allEvents, selectedDay]);

  // Views Renderers
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 h-full border-l border-t border-[var(--card-border)]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="py-4 border-r border-b border-[var(--card-border)] bg-[var(--foreground)]/[0.02] text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]/80"
          >
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const dayEvents = allEvents.filter((e) => isSameDay(e.date, day));
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={i}
              onClick={() => {
                setSelectedDay(day);
                setIsDayModalOpen(true);
              }}
              className={`min-h-[140px] p-4 border-r border-b border-[var(--card-border)] transition-all hover:bg-[var(--foreground)]/[0.03] cursor-pointer group flex flex-col gap-2 ${!isCurrentMonth ? "opacity-30 grayscale-[0.8] bg-[var(--foreground)]/[0.02]" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-bold ${isToday(day) ? "w-7 h-7 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-500/20" : "text-[var(--text-secondary)]"}`}
                >
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                )}
              </div>

              <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEvent(event);
                      setIsDetailModalOpen(true);
                    }}
                    className={`${event.color} text-[9px] font-bold py-1 px-2 rounded-md transition-all hover:scale-[1.02] border border-white/20 shadow-sm text-white`}
                  >
                    <span className="opacity-60 mr-1">
                      {format(event.date, "HH:mm")}
                    </span>{" "}
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] pl-2">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
      start: start,
      end: addDays(start, 6),
    });

    return (
      <div className="flex h-full border-t border-[var(--card-border)]">
        {weekDays.map((day, i) => {
          const dayEvents = allEvents.filter((e) => isSameDay(e.date, day));
          return (
            <div
              key={i}
              className="flex-1 border-r border-[var(--card-border)] flex flex-col group transition-all hover:bg-[var(--foreground)]/[0.01]"
            >
              <div
                className={`p-6 border-b border-[var(--card-border)] text-center flex flex-col items-center gap-1 ${isToday(day) ? "bg-[var(--foreground)]/[0.03]" : ""}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                  {format(day, "EEE")}
                </span>
                <span
                  className={`text-2xl font-black ${isToday(day) ? "text-[var(--accent-primary)]" : "text-[var(--foreground)]"}`}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div
                className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar"
                onClick={() => {
                  setSelectedDay(day);
                  setIsAddModalOpen(true);
                }}
              >
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEvent(event);
                      setIsDetailModalOpen(true);
                    }}
                    className={`p-4 rounded-2xl ${event.color} border border-white/20 shadow-xl group/event cursor-pointer hover:translate-y-[-2px] transition-all text-white`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest opacity-70 text-white/80`}
                      >
                        {event.type === "manual" ? event.category : event.type}
                      </span>
                      <span className={`text-[10px] font-bold text-white/70`}>
                        {format(event.date, "HH:mm")}
                      </span>
                    </div>
                    <h5
                      className={`text-xs font-bold leading-tight line-clamp-2 text-white`}
                    >
                      {event.title}
                    </h5>
                    {event.projectName && (
                      <p
                        className={`text-[9px] font-bold mt-2 truncate flex items-center gap-1 text-white/50`}
                      >
                        <MapPin size={10} /> {event.projectName}
                      </p>
                    )}
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <div className="h-full border-2 border-dashed border-[var(--card-border)] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-gray-600">
                    <Plus size={24} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--background)] rounded-[2.5rem] border border-[var(--card-border)] overflow-hidden shadow-2xl">
        {/* Toolbar */}
        <header className="px-10 py-8 flex justify-between items-center border-b border-[var(--card-border)] bg-[var(--foreground)]/[0.02]">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tighter flex items-center gap-3">
              <CalendarIcon className="text-[var(--accent-primary)]" />
              {format(
                currentDate,
                view === "month" ? "MMMM yyyy" : "MMM d, yyyy",
              )}
            </h2>
            <div className="flex bg-[var(--foreground)]/[0.05] rounded-2xl p-1 border border-[var(--card-border)]">
              <button
                onClick={() => setView("month")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === "month" ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg" : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"}`}
              >
                <LayoutGrid size={14} /> Month
              </button>
              <button
                onClick={() => setView("week")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === "week" ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg" : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"}`}
              >
                <AlignJustify size={14} /> Week
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[var(--foreground)]/[0.05] rounded-2xl p-1 border border-[var(--card-border)]">
              <button
                onClick={prev}
                className="p-2 hover:bg-[var(--foreground)]/[0.05] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all rounded-xl"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 hover:bg-[var(--foreground)]/[0.05] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all rounded-xl uppercase tracking-widest"
              >
                Today
              </button>
              <button
                onClick={next}
                className="p-2 hover:bg-[var(--foreground)]/[0.05] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all rounded-xl"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedDay(new Date());
                setIsAddModalOpen(true);
              }}
              className="bg-[var(--foreground)] text-[var(--background)] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              <Plus size={16} /> Add Event
            </button>
          </div>
        </header>

        {/* View Layout */}
        <main className="flex-1 overflow-auto">
          {view === "month" ? renderMonthView() : renderWeekView()}
        </main>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Schedule"
      >
        <Formik
          initialValues={{ title: "", category: "Work", time: "09:00" }}
          validationSchema={EventSchema}
          onSubmit={handleAddEvent}
        >
          {({
            values,
            setFieldValue,
            touched,
            errors,
            isSubmitting: formikSubmitting,
          }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest pl-1">
                    Event Date
                  </label>
                  <div className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-[var(--foreground)] font-bold opacity-80 text-xs">
                    {selectedDay
                      ? format(selectedDay, "MMM d, yyyy")
                      : "Select a day"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest pl-1">
                    Time
                  </label>
                  <TimePicker
                    value={values.time}
                    onChange={(val) => setFieldValue("time", val)}
                  />
                  <FormError touched={touched.time} message={errors.time} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest pl-1">
                  Event Name
                </label>
                <Field
                  name="title"
                  placeholder="What's happening?"
                  className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none transition-all ${touched.title && errors.title ? "border-red-500/50" : "border-[var(--input-border)] focus:border-[var(--accent-primary)]"}`}
                />
                <FormError touched={touched.title} message={errors.title} />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Work", "Other", "Meeting", "Personal"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFieldValue("category", cat)}
                      className={`py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${values.category === cat ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-lg shadow-purple-500/30" : "bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <FormError
                  touched={touched.category}
                  message={errors.category}
                />
              </div>
              <button
                disabled={isSubmitting || formikSubmitting}
                type="submit"
                className="w-full py-4 rounded-[2rem] font-black text-sm tracking-widest uppercase transition-all shadow-xl bg-[var(--accent-primary)] text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-purple-500/20"
              >
                {isSubmitting || formikSubmitting
                  ? "Creating..."
                  : "Save Event"}
              </button>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setIsEditMode(false);
        }}
        title={isEditMode ? "Edit Event" : "Event Details"}
      >
        {activeEvent && (
          <div className="space-y-8">
            {isEditMode ? (
              <Formik
                initialValues={{
                  title: activeEvent.title,
                  category: activeEvent.category || "Work",
                  date: activeEvent.date,
                  time: format(activeEvent.date, "HH:mm"),
                }}
                validationSchema={EventSchema.concat(
                  Yup.object({
                    date: Yup.date().required("Date is required"),
                  }),
                )}
                onSubmit={handleSaveEdit}
              >
                {({
                  values,
                  setFieldValue,
                  touched,
                  errors,
                  isSubmitting: formikSubmitting,
                }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest pl-1">
                          Event Date
                        </label>
                        <div
                          className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] transition-all text-xs flex justify-between items-center ${touched.date && errors.date ? "border-red-500/50" : "border-[var(--input-border)]"}`}
                        >
                          <span>
                            {values.date
                              ? format(values.date, "MMM d, yyyy")
                              : "Select Date"}
                          </span>
                          <CalendarIcon
                            size={14}
                            className="text-[var(--text-secondary)]"
                          />
                        </div>
                        <FormError
                          touched={!!touched.date}
                          message={errors.date as string}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest pl-1">
                          Time
                        </label>
                        <TimePicker
                          value={values.time}
                          onChange={(val) => setFieldValue("time", val)}
                        />
                        <FormError
                          touched={touched.time}
                          message={errors.time}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest pl-1">
                        Event Name
                      </label>
                      <Field
                        name="title"
                        className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none transition-all ${touched.title && errors.title ? "border-red-500/50" : "border-[var(--input-border)] focus:border-[var(--accent-primary)]"}`}
                      />
                      <FormError
                        touched={touched.title}
                        message={errors.title}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest pl-1">
                        Category
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Work", "Other", "Meeting", "Personal"].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFieldValue("category", cat)}
                            className={`py-3 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${values.category === cat ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white" : "bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--foreground)]/20"}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="flex-1 py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.1]"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isSubmitting || formikSubmitting}
                        type="submit"
                        className="flex-1 py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-[var(--accent-primary)] text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-purple-500/20"
                      >
                        {isSubmitting || formikSubmitting
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center p-8 bg-[var(--foreground)]/[0.03] rounded-3xl border border-[var(--card-border)]">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${activeEvent.color} shadow-lg`}
                  >
                    {activeEvent.type === "manual" ? (
                      <Clock className="text-white" />
                    ) : (
                      <CalendarIcon className="text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-[var(--foreground)] text-center tracking-tight leading-tight">
                    {activeEvent.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--text-secondary)] font-bold text-xs uppercase tracking-widest">
                    {format(activeEvent.date, "PPPP")} -{" "}
                    {format(activeEvent.date, "HH:mm")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--foreground)]/[0.03] rounded-2xl p-5 border border-[var(--card-border)]">
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest mb-1">
                      Source
                    </p>
                    <p className="text-[var(--foreground)] font-bold text-sm uppercase">
                      {activeEvent.type}
                    </p>
                  </div>
                  <div className="bg-[var(--foreground)]/[0.03] rounded-2xl p-5 border border-[var(--card-border)]">
                    <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest mb-1">
                      Project
                    </p>
                    <p className="text-[var(--foreground)] font-bold text-sm truncate">
                      {activeEvent.projectName || "None"}
                    </p>
                  </div>
                </div>

                {activeEvent.type === "manual" ? (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={startEditing}
                      className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-[var(--foreground)]/[0.05] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.1]"
                    >
                      Edit Event
                    </button>
                    <button
                      onClick={() => setEventToDelete(activeEvent)}
                      className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    System generated event (read-only)
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center">
            <Trash2 size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-2">
            Delete Event?
          </h2>
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            Are you sure you want to permanently remove{" "}
            <strong className="text-[var(--foreground)]">
              {eventToDelete?.title}
            </strong>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={() => setEventToDelete(null)}
            className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.1]"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>
      </Modal>

      {/* Day Overview Modal */}
      <Modal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        title={
          selectedDay
            ? `Schedules - ${format(selectedDay, "MMMM d, yyyy")}`
            : "Daily Schedules"
        }
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)] opacity-80">
              Today's Timeline
            </p>
            <button
              onClick={() => {
                setIsDayModalOpen(false);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <Plus size={14} /> Add Event
            </button>
          </div>

          <div className="space-y-3 max-h-[375px] overflow-y-auto pr-3 custom-scrollbar flex flex-col pt-1 pb-1">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setActiveEvent(event);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-full text-left bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] border border-[var(--card-border)] hover:border-[var(--accent-primary)]/30 p-5 rounded-3xl transition-all group/dayevent flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${event.color} flex items-center justify-center shadow-lg shadow-purple-500/10`}
                    >
                      <Clock size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest">
                          {format(event.date, "HH:mm")}
                        </span>
                        {event.projectName && (
                          <>
                            <span className="text-[var(--text-secondary)] opacity-30">
                              •
                            </span>
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate flex items-center gap-1">
                              <MapPin size={10} /> {event.projectName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0"
                  />
                </button>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-[var(--foreground)]/[0.02] rounded-[2rem] border border-dashed border-[var(--card-border)]">
                <div className="w-12 h-12 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--text-secondary)]">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <p className="text-[var(--foreground)] text-sm font-bold opacity-80">
                    No schedules recorded
                  </p>
                  <p className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest mt-1">
                    Click the button above to add site tasks
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [h, m] = value.split(":");

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = [
    "00",
    "05",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55",
  ];

  const setHour = (newH: string) => onChange(`${newH}:${m}`);
  const setMin = (newM: string) => onChange(`${h}:${newM}`);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-[var(--foreground)] transition-all hover:bg-[var(--foreground)]/[0.1] group"
      >
        <span className="text-sm font-black tracking-tight">
          {h} : {m}
        </span>
        <Clock
          size={16}
          className={`text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors ${isOpen ? "text-[var(--accent-primary)]" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 z-[70] bg-[var(--background)]/95 backdrop-blur-xl border border-[var(--card-border)] rounded-[2rem] p-4 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex gap-2 h-40 overflow-hidden">
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-1">
                <p className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.2em] text-center mb-3 sticky top-0 bg-transparent backdrop-blur-sm py-2 z-10">
                  Hour
                </p>
                <div className="space-y-1">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setHour(hour)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${h === hour ? "bg-[var(--accent-primary)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"}`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-px bg-[var(--card-border)] my-2" />
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-1">
                <p className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-[0.2em] text-center mb-3 sticky top-0 bg-transparent backdrop-blur-sm py-2 z-10">
                  Min
                </p>
                <div className="space-y-1">
                  {minutes.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setMin(min)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${m === min ? "bg-[var(--accent-primary)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"}`}
                    >
                      {min}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}
