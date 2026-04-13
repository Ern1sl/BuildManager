"use client";

import { useState, useEffect, useMemo } from "react";
import Modal from "./Modal";
import { Plus, Trash2, Info, Users as UsersIcon, Check, Search, MapPin, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { createProject, updateProject } from "@/lib/actions/projects";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import FormError from "./FormError";
import { useSettings } from "./SettingsContext";
import CustomSelect from "./CustomSelect";
import { useSafety } from "./SafetyContext";

const ProjectSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name is too short")
    .required("Project name is required"),
  client: Yup.string(),
  deadline: Yup.string()
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, "Use DD/MM/YYYY")
    .required("Deadline is required"),
  budget: Yup.number().positive("Budget must be positive").nullable(),
  phases: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Phase name is required"),
        importance: Yup.string().required(),
        deadline: Yup.string().matches(/^\d{2}\/\d{2}\/\d{4}$/, "Use DD/MM/YYYY").nullable(),
      })
    )
    .min(1, "At least one phase is required"),
});

interface Worker {
  id: string;
  name: string;
  role: string;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableWorkers: Worker[];
  initialData?: any; // If provided, we are in Edit Mode
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  availableWorkers,
  initialData,
}: ProjectFormModalProps) {
  const { isGhostMode } = useSafety();
  const { currency } = useSettings();
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerRoleFilter, setWorkerRoleFilter] = useState("Any");
  const [workerPage, setWorkerPage] = useState(0);
  const [isPaginating, setIsPaginating] = useState(false);

  useEffect(() => {
    setWorkerPage(0);
  }, [workerSearch, workerRoleFilter]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    setIsPaginating(true);
    setTimeout(() => {
      setWorkerPage(prev => direction === 'next' ? prev + 1 : prev - 1);
      setIsPaginating(false);
    }, 400); // 400ms loading effect
  };

  const parseDDMMYYYY = (val: string) => {
    // converts DD/MM/YYYY to a Date object, or undefined
    if (!val) return undefined;
    const parts = val.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m - 1, d);
      }
    }
    return undefined;
  };

  const formatDDMMYYYY = (dateObj: Date | string | undefined) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateInput = (input: string) => {
    let v = input.replace(/\D/g, ""); // Strip non-digits

    // Validate DD
    if (v.length > 0 && parseInt(v[0]) > 3) v = "0" + v;
    if (v.length >= 2) {
      let dd = parseInt(v.slice(0, 2));
      if (dd === 0) v = "01" + v.slice(2);
      if (dd > 31) v = "31" + v.slice(2);
    }
    
    // Validate MM
    if (v.length > 2 && parseInt(v[2]) > 1) v = v.slice(0, 2) + "0" + v.slice(2);
    if (v.length >= 4) {
      let mm = parseInt(v.slice(2, 4));
      if (mm === 0) v = v.slice(0, 2) + "01" + v.slice(4);
      if (mm > 12) v = v.slice(0, 2) + "12" + v.slice(4);
    }

    // Reconstruct with slashes
    if (v.length > 4) {
      return v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4, 8);
    } else if (v.length > 2) {
      return v.slice(0, 2) + "/" + v.slice(2);
    }
    return v;
  };

  // Handle sync via Formik initialValues prop directly instead of useEffect for simpler logic
  const initialValues = useMemo(() => {
    if (initialData && isOpen) {
      return {
        name: initialData.name || "",
        client: initialData.client || "",
        deadline: initialData.deadline ? formatDDMMYYYY(initialData.deadline) : "",
        budget: initialData.budget?.toString() || "",
        currency: initialData.currency || "EUR",
        location: initialData.location || "",
        workerIds: initialData.workers?.map((w: any) => w.id) || [],
        phases: initialData.phases?.map((p: any) => ({
          name: p.name,
          importance: p.importance,
          deadline: p.deadline ? formatDDMMYYYY(p.deadline) : "",
          checked: p.checked
        })) || [{ name: "", importance: "Gray", deadline: "" }]
      };
    }
    return {
      name: "",
      client: "",
      deadline: "",
      budget: "",
      currency: currency,
      location: "",
      workerIds: [],
      phases: [{ name: "", importance: "Gray", deadline: "" }]
    };
  }, [initialData, isOpen]);



  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    const parsedDeadline = parseDDMMYYYY(values.deadline);
    
    const payload = {
      name: values.name,
      client: values.client,
      deadline: parsedDeadline,
      budget: values.budget ? parseFloat(values.budget) : undefined,
      currency: values.currency,
      color: initialData?.color || "bg-blue-500",
      location: values.location,
      workerIds: values.workerIds,
      phases: values.phases.map((p: any) => ({
        name: p.name,
        importance: p.importance,
        deadline: parseDDMMYYYY(p.deadline),
        checked: p.checked
      })),
    };

    const result = isEdit 
      ? await updateProject(initialData.id, payload)
      : await createProject(payload);

    setIsSubmitting(false);
    if (result.success) {
      onClose();
    } else {
      alert(`Error ${isEdit ? 'updating' : 'creating'} project`);
    }
  };



  const availableRoles = useMemo(() => {
    const roles = new Set(availableWorkers.map(w => w.role));
    return ["Any", ...Array.from(roles)];
  }, [availableWorkers]);

  const filteredWorkers = useMemo(() => {
    return availableWorkers.filter(w => {
      const matchSearch = w.name.toLowerCase().includes(workerSearch.toLowerCase()) || w.role.toLowerCase().includes(workerSearch.toLowerCase());
      const matchRole = workerRoleFilter === "Any" || w.role === workerRoleFilter;
      return matchSearch && matchRole;
    });
  }, [availableWorkers, workerSearch, workerRoleFilter]);

  const totalPages = Math.ceil(filteredWorkers.length / 6);
  const displayedWorkers = useMemo(() => {
    return filteredWorkers.slice(workerPage * 6, (workerPage + 1) * 6);
  }, [filteredWorkers, workerPage]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? `Edit ${initialData?.name}` : "New Project"}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={ProjectSchema}
        onSubmit={handleSubmit}
      >
        {({ values, touched, errors, setFieldValue, isSubmitting: formikSubmitting }) => (
          <Form className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">Project Name</label>
                <Field
                  name="name"
                  className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none transition-all ${touched.name && errors.name ? 'border-red-500/50' : 'border-[var(--input-border)] focus:border-[var(--accent-primary)]'}`}
                  placeholder="e.g. Northgate Phase 3"
                />
                <FormError touched={!!touched.name} message={errors.name as string | undefined} />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">Client Name (Optional)</label>
                <Field
                  name="client"
                  className={`w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)] transition-all duration-500 ${isGhostMode ? 'ghost-blur' : ''}`}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">Deadline (DD/MM/YYYY)</label>
                <Field name="deadline">
                  {({ field }: any) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="10/04/2026"
                      onChange={(e) => setFieldValue("deadline", formatDateInput(e.target.value))}
                      className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none transition-all ${touched.deadline && errors.deadline ? 'border-red-500/50' : 'border-[var(--input-border)] focus:border-[var(--accent-primary)]'}`}
                    />
                  )}
                </Field>
                <FormError touched={!!touched.deadline} message={errors.deadline as string | undefined} />
              </div>
              <div className="space-y-2">
                <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">Budget (Optional)</label>
                <div className={`relative transition-all duration-500 ${isGhostMode ? 'ghost-blur' : ''}`}>
                  <Field
                    name="budget"
                    type="number"
                    className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none transition-all pl-12 ${touched.budget && errors.budget ? 'border-red-500/50' : 'border-[var(--input-border)] focus:border-[var(--accent-primary)]'}`}
                    placeholder="0.00"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-1">
                    <button 
                      type="button"
                      onClick={() => setFieldValue("currency", values.currency === 'EUR' ? 'USD' : 'EUR')}
                      className="text-[var(--accent-primary)] font-black text-xs hover:scale-110 transition-transform"
                    >
                      {values.currency === 'EUR' ? '€' : '$'}
                    </button>
                  </div>
                </div>
                <FormError touched={!!touched.budget} message={errors.budget as string | undefined} />
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">Project Location (Optional)</label>
              <div className={`relative transition-all duration-500 ${isGhostMode ? 'ghost-blur' : ''}`}>
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-70" />
                <Field
                  name="location"
                  type="text"
                  className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 pl-11 text-[var(--foreground)] focus:outline-none transition-all ${touched.location && errors.location ? 'border-red-500/50' : 'border-[var(--input-border)] focus:border-[var(--accent-primary)]'}`}
                  placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pl-1">
                 <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <UsersIcon size={12} /> Assign Personnel (Optional)
                 </label>
                 {totalPages > 1 && (
                   <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handlePageChange('prev')} 
                        disabled={workerPage === 0 || isPaginating}
                        className="p-1 rounded bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      >
                         <ChevronLeft size={16} />
                      </button>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] min-w-[32px] text-center">
                        {workerPage + 1} / {totalPages}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handlePageChange('next')} 
                        disabled={workerPage >= totalPages - 1 || isPaginating}
                        className="p-1 rounded bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      >
                         <ChevronRight size={16} />
                      </button>
                   </div>
                 )}
              </div>
              <div className="flex gap-2">
                 <div className="relative flex-1 h-full">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                   <input 
                     type="text"
                     placeholder="Search name or index..."
                     value={workerSearch}
                     onChange={(e) => setWorkerSearch(e.target.value)}
                     className="w-full h-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl pl-10 pr-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                   />
                 </div>
                 <CustomSelect 
                    options={availableRoles.map(r => ({ id: r, name: r }))}
                    value={workerRoleFilter}
                    onChange={(val) => setWorkerRoleFilter(val as string)}
                 />
              </div>
              <div className="relative min-h-[170px]">
                {isPaginating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/60 backdrop-blur-[2px] z-10 rounded-xl transition-all">
                    <Loader2 size={24} className="animate-spin text-[var(--accent-primary)]" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pr-2 pb-1">
                  {displayedWorkers.map(worker => (
                    <button
                      key={worker.id}
                      type="button"
                      onClick={() => {
                        const current = values.workerIds;
                        const next = current.includes(worker.id)
                          ? current.filter((id: string) => id !== worker.id)
                          : [...current, worker.id];
                        setFieldValue("workerIds", next);
                      }}
                      className={`p-3 rounded-xl border transition-all text-left flex justify-between items-center ${
                        values.workerIds.includes(worker.id) 
                          ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--foreground)]" 
                          : "bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--foreground)]/20"
                      }`}
                    >
                      <div>
                        <p className="text-[11px] font-bold truncate pr-1">{worker.name}</p>
                        <p className="text-[9px] opacity-60 uppercase">{worker.role}</p>
                      </div>
                      {values.workerIds.includes(worker.id) && <Check size={14} className="text-[var(--accent-primary)] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <FieldArray name="phases">
              {({ push, remove }) => (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">Phases</label>
                  </div>
                  
                  <div className="space-y-3">
                    {values.phases.map((_phase: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex gap-3 bg-[var(--foreground)]/[0.03] p-4 rounded-2xl border border-[var(--card-border)] items-end">
                          <div className="flex-1 space-y-2">
                            <Field
                              name={`phases.${index}.name`}
                              placeholder="Phase Name"
                              className="w-full bg-transparent border-b border-[var(--card-border)] text-xs font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)] py-1"
                            />
                            <div className="flex gap-4 items-center pl-2">
                              <div className="flex gap-2 bg-[var(--foreground)]/[0.05] p-1.5 rounded-xl border border-[var(--card-border)]">
                                {['Gray', 'Orange', 'Red'].map(color => (
                                  <button 
                                    key={color}
                                    type="button"
                                    onClick={() => setFieldValue(`phases.${index}.importance`, color)}
                                    className={`w-4 h-4 rounded-full transition-all ${values.phases[index].importance === color 
                                      ? `scale-110 ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--background)] ${color === 'Gray' ? 'bg-zinc-500' : color === 'Orange' ? 'bg-orange-500' : 'bg-red-500'}` 
                                      : `${color === 'Gray' ? 'bg-zinc-500/30 hover:bg-zinc-500/70' : color === 'Orange' ? 'bg-orange-500/30 hover:bg-orange-500/70' : 'bg-red-500/30 hover:bg-red-500/70'}`}`}
                                  />
                                ))}
                              </div>
                              <input
                                type="text"
                                placeholder="DD/MM/YYYY"
                                value={values.phases[index].deadline}
                                onChange={(e) => setFieldValue(`phases.${index}.deadline`, formatDateInput(e.target.value))}
                                className="bg-transparent text-[10px] w-24 font-bold text-[var(--text-secondary)] uppercase tracking-widest focus:outline-none focus:text-[var(--accent-primary)] transition-colors border-b border-transparent focus:border-[var(--accent-primary)] placeholder:text-[var(--text-secondary)]/50"
                              />
                            </div>
                          </div>
                          {values.phases.length > 1 && (
                            <button type="button" onClick={() => remove(index)} className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <FormError 
                          touched={!!(touched.phases && (touched.phases as any)[index]?.name)} 
                          message={(errors.phases && (errors.phases as any)[index]?.name) as string | undefined} 
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => push({ name: "", importance: "Gray", deadline: "" })}
                    className="w-full py-3 rounded-2xl border border-dashed border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Plus size={14} /> Add Phase
                  </button>
                </div>
              )}
            </FieldArray>

            <button
              disabled={isSubmitting || formikSubmitting}
              className={`w-full py-4 rounded-[2rem] font-black text-sm tracking-widest uppercase transition-all shadow-xl ${
                !isSubmitting && !formikSubmitting
                  ? "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity active:scale-[0.98]"
                  : "bg-[var(--foreground)]/[0.05] text-[var(--text-secondary)] cursor-not-allowed"
              }`}
            >
              {isSubmitting || formikSubmitting ? "Saving..." : isEdit ? "Update Project" : "Launch Project"}
            </button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
