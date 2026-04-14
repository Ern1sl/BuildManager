"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getScopedKey } from "@/lib/storage";
import { Plus, Eye, EyeOff, UserPlus, Briefcase, Trash2 } from "lucide-react";
import { useSafety } from "./SafetyContext";
import Modal from "./Modal";
import { createWorker, deleteWorker, createRole } from "@/lib/actions/workers";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import FormError from "./FormError";
import CustomSelect from "./CustomSelect";

const PersonnelSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name is too short")
    .required("Full name is required"),
  role: Yup.string().required("Please select a role"),
  monthlyPay: Yup.number()
    .min(0, "Pay cannot be negative")
    .required("Monthly pay is required"),
});

const RoleSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Role title is too short")
    .required("Role title is required"),
});

interface TeamClientProps {
  initialWorkers: any[];
  roles: any[];
  projects: any[];
}

export default function TeamClient({ initialWorkers, roles, projects }: TeamClientProps) {
  const { isGhostMode } = useSafety();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Sync with localStorage for persistence when user changes
  useEffect(() => {
    if (!userId) {
      setShowPay(true);
      return;
    }
    const saved = localStorage.getItem(getScopedKey(userId, "show_personnel_pay"));
    if (saved !== null) {
      setShowPay(saved === "true");
    } else {
      setShowPay(true);
    }
  }, [userId]);

  const togglePay = () => {
    const next = !showPay;
    setShowPay(next);
    if (userId) localStorage.setItem(getScopedKey(userId, "show_personnel_pay"), String(next));
  };
  
  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail & Delete State
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [workerToDelete, setWorkerToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers
  const handleAddUser = async (values: any, { resetForm }: any) => {
    setIsSubmitting(true);
    await createWorker({
      name: values.name,
      role: values.role,
      monthlyPay: parseFloat(values.monthlyPay) || 500,
      projectId: values.projectId || undefined
    });
    setIsSubmitting(false);
    setIsAddUserOpen(false);
    resetForm();
  };

  const handleAddRole = async (values: any, { resetForm }: any) => {
    setIsSubmitting(true);
    await createRole(values.name.trim());
    setIsSubmitting(false);
    setIsAddRoleOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!workerToDelete) return;
    setIsDeleting(true);
    await deleteWorker(workerToDelete.id);
    setIsDeleting(false);
    setWorkerToDelete(null);
    setSelectedWorker(null); // Also clear detail modal
  };

  const totalPayroll = initialWorkers.reduce((acc, w) => acc + (w.monthlyPay || 0), 0);

  return (
    <>
      <div className="flex flex-col gap-8 max-w-5xl">
        <div className="flex justify-between items-end">
          <header>
            <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-1">Personnel</h1>
            <p className="text-[var(--text-secondary)] font-semibold tracking-tight">Manage site workforce, roles, and monthly compensation</p>
          </header>
          <div className="flex items-center gap-3 pb-1">
            <button
              onClick={() => setIsAddRoleOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] font-bold text-xs tracking-widest uppercase hover:bg-[var(--foreground)]/[0.1] transition-colors flex items-center gap-2"
            >
              <Briefcase size={16} /> Add Role
            </button>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-bold text-xs tracking-widest uppercase hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xl"
            >
              <UserPlus size={16} /> Add Personnel
            </button>
          </div>
        </div>

        <div className="window-panel p-10 border border-[var(--card-border)] shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-widest border-b border-[var(--card-border)]">
                <th className="pb-6 pl-2">Name</th>
                <th className="pb-6">Role</th>
                <th className="pb-6 text-center">Assigned site</th>
                <th className="pb-6 text-right flex items-center justify-end gap-2 pr-2">
                  Monthly pay
                  <button onClick={togglePay} className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
                    {showPay ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </th>
                <th className="pb-6 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {initialWorkers.map((worker) => {
                return (
                  <tr 
                    key={worker.id} 
                    onClick={() => setSelectedWorker(worker)}
                    className="group hover:bg-[var(--foreground)]/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-5 pl-2">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-[var(--foreground)]/[0.1] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] opacity-60 shadow-inner">
                          👤
                        </div>
                        <span className={`text-[var(--foreground)] text-sm font-bold tracking-tight transition-all duration-500 ${isGhostMode ? 'ghost-blur' : ''}`}>
                          {worker.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-[var(--foreground)]/[0.05] text-[var(--text-secondary)] border border-[var(--card-border)]">
                        {worker.role}
                      </span>
                    </td>
                    <td className="py-5 text-center text-[var(--foreground)] text-xs font-bold">
                      {worker.project?.name || "Unassigned"}
                    </td>
                    <td className="py-5 text-right font-bold pr-2">
                        {showPay ? (
                          <span className={`text-[var(--foreground)] text-xs tracking-wider transition-all duration-500 ${isGhostMode ? 'ghost-blur' : ''}`}>
                            €{worker.monthlyPay?.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[var(--text-secondary)] text-lg tracking-widest leading-none translate-y-1 inline-block">••••••</span>
                        )}
                    </td>
                    <td className="py-5 w-10"></td>
                  </tr>
                );
              })}
              {initialWorkers.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-10 text-center text-[var(--text-secondary)] text-xs uppercase font-bold tracking-widest">
                       No personnel found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="mt-10 pt-8 border-t border-[var(--card-border)] flex justify-end items-center gap-4">
            <span className="text-[var(--text-secondary)] font-semibold text-sm tracking-tight">Total monthly payroll:</span>
            {showPay ? (
                <span className={`text-[var(--foreground)] text-2xl font-bold tracking-tighter transition-all duration-500 ${isGhostMode ? 'ghost-blur' : ''}`}>
                  €{totalPayroll.toLocaleString()}
                </span>
            ) : (
                <span className="text-[var(--text-secondary)] text-3xl font-bold tracking-widest translate-y-1 inline-block">••••••••</span>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Add Personnel">
         <Formik
          initialValues={{ 
            name: "", 
            role: roles[0]?.name || "", 
            projectId: "", 
            monthlyPay: "500" 
          }}
          validationSchema={PersonnelSchema}
          onSubmit={handleAddUser}
         >
           {({ values, setFieldValue, touched, errors, isSubmitting: formikSubmitting }) => (
             <Form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">Full Name</label>
                  <Field 
                    name="name" 
                    placeholder="John Doe" 
                    className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none transition-all ${touched.name && errors.name ? 'border-red-500/50' : 'border-[var(--input-border)] focus:border-[var(--accent-primary)]'}`} 
                  />
                  <FormError touched={touched.name} message={errors.name} />
                </div>
                <div className="flex gap-4">
                    <CustomSelect 
                        label="Role"
                        options={roles}
                        value={values.role}
                        onChange={(val) => setFieldValue("role", val)}
                        placeholder="Select Role"
                        touched={!!touched.role}
                        error={errors.role as string | undefined}
                    />
                    <CustomSelect 
                        label="Site Assigned (Optional)"
                        options={[
                            { id: "", name: "Unassigned" },
                            ...projects
                        ]}
                        value={values.projectId}
                        onChange={(val) => setFieldValue("projectId", val)}
                        placeholder="Unassigned"
                        touched={!!touched.projectId}
                        error={errors.projectId as string | undefined}
                    />
                </div>
                <div className="space-y-2">
                  <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">Monthly Pay (€)</label>
                  <Field 
                    name="monthlyPay" 
                    type="number" 
                    className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none transition-all ${touched.monthlyPay && errors.monthlyPay ? 'border-red-500/50' : 'border-[var(--input-border)] focus:border-[var(--accent-primary)]'}`} 
                  />
                  <FormError touched={touched.monthlyPay} message={errors.monthlyPay} />
                </div>
                <button disabled={isSubmitting || formikSubmitting || roles.length === 0} type="submit" className="w-full py-4 rounded-[2rem] font-black text-sm tracking-widest uppercase transition-all shadow-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting || formikSubmitting ? "Adding..." : "Add Personnel"}
                </button>
             </Form>
           )}
         </Formik>
      </Modal>

      {/* Add Role Modal */}
      <Modal isOpen={isAddRoleOpen} onClose={() => setIsAddRoleOpen(false)} title="Create New Role">
         <Formik
          initialValues={{ name: "" }}
          validationSchema={RoleSchema}
          onSubmit={handleAddRole}
         >
           {({ touched, errors, isSubmitting: formikSubmitting }) => (
             <Form className="space-y-6 flex flex-col">
                <div className="space-y-2">
                  <label className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest pl-1">Role Title</label>
                  <Field 
                    name="name" 
                    placeholder="e.g. Architect" 
                    className={`w-full bg-[var(--input-bg)] border rounded-2xl px-4 py-3 text-[var(--foreground)] focus:outline-none transition-all ${touched.name && errors.name ? 'border-red-500/50' : 'border-[var(--input-border)] focus:border-[var(--accent-primary)]'}`} 
                  />
                  <FormError touched={touched.name} message={errors.name} />
                </div>
                <button disabled={isSubmitting || formikSubmitting} type="submit" className="w-full py-4 rounded-[2rem] font-black text-sm tracking-widest uppercase transition-all shadow-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-4">
                    {isSubmitting || formikSubmitting ? "Creating..." : "Save Role"}
                </button>
             </Form>
           )}
         </Formik>
      </Modal>

      {/* Detail Modal */}
      {selectedWorker && (
        <Modal isOpen={!!selectedWorker} onClose={() => setSelectedWorker(null)} title="Personnel Details">
           <div className="flex flex-col items-center justify-center p-6 bg-[var(--foreground)]/[0.03] rounded-3xl border border-[var(--card-border)]">
              <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center bg-[var(--foreground)]/[0.1] border border-[var(--card-border)] text-[var(--foreground)] opacity-60 text-2xl shadow-xl">
                 👤
              </div>
              <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">{selectedWorker.name}</h2>
              <p className="text-[10px] font-bold px-3 py-1 mt-2 rounded-md bg-[var(--foreground)]/[0.05] text-[var(--text-secondary)] border border-[var(--card-border)]">
                 {selectedWorker.role}
              </p>
              
              <div className="w-full grid grid-cols-2 gap-4 mt-8">
                 <div className="bg-[var(--foreground)]/[0.03] rounded-2xl p-4 border border-[var(--card-border)] text-center">
                    <p className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest">Site Assigned</p>
                    <p className="text-[var(--foreground)] font-bold text-sm mt-1">{selectedWorker.project?.name || "Unassigned"}</p>
                 </div>
                 <div className="bg-[var(--foreground)]/[0.03] rounded-2xl p-4 border border-[var(--card-border)] text-center">
                    <p className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest">Monthly Pay</p>
                    <p className="text-[var(--foreground)] font-bold text-sm mt-1">€{selectedWorker.monthlyPay?.toLocaleString()}</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={() => alert("Edit mode coming soon!")}
                className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-[var(--foreground)]/[0.05] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.1]"
              >
                 Edit Personnel
              </button>
              <button 
                onClick={() => setWorkerToDelete(selectedWorker)}
                className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
              >
                 Delete
              </button>
           </div>
        </Modal>
      )}

      {/* Confirm Delete Modal */}
      {workerToDelete && (
        <Modal isOpen={!!workerToDelete} onClose={() => setWorkerToDelete(null)} title="Confirm Deletion">
           <div className="text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center">
                 <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-2">Remove Personnel?</h2>
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                 Are you sure you want to permanently remove <strong className="text-[var(--foreground)]">{workerToDelete.name}</strong> from the system? This action cannot be undone.
              </p>
           </div>
           <div className="grid grid-cols-2 gap-4 mt-4">
              <button 
                onClick={() => setWorkerToDelete(null)}
                className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-[var(--foreground)]/[0.05] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.1]"
              >
                 Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-4 rounded-[2rem] font-black text-xs tracking-widest uppercase transition-all bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
           </div>
        </Modal>
      )}
    </>
  );
}
