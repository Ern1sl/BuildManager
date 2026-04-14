"use client";

import { useState, Suspense, useEffect } from "react";
import { User, ShieldCheck, Palette, Globe, Trash2, Camera, Check, AlertTriangle, KeyRound, Mail, X, History, ShieldAlert } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { useSafety } from "@/components/SafetyContext";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { updatePassword, updateProfile, deleteAccount, resetPasswordWithToken } from "@/lib/actions/user";
import { superFactoryReset } from "@/lib/actions/system";
import { sendResetEmail } from "@/lib/actions/email";
import FormError from "@/components/FormError";
import ConfirmModal from "@/components/ConfirmModal";
import Modal from "@/components/Modal";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getScopedKey } from "@/lib/storage";

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Required"),
});

function SettingsContent() {
  const { 
    theme, setTheme, 
    currency, setCurrency, 
    avatar, setAvatar, 
    userName, setUserName 
  } = useSettings();
  const { data: session } = useSession();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const tabParam = searchParams.get("tab") as any;
  
  const [activeTab, setActiveTab ] = useState<"identity" | "security" | "display">(tabParam || "identity");

  useEffect(() => {
    if (token || tabParam === "security") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab("security");
    }
  }, [token, tabParam]);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSaving, setIsSaving ] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const { setSafetyPin, hasCustomPin } = useSafety();
  const [newPin, setNewPin] = useState("");
  const [pinStatus, setPinStatus] = useState(false);

  const handlePinUpdate = () => {
    if (newPin.length === 4) {
      setSafetyPin(newPin);
      setPinStatus(true);
      setNewPin("");
      setTimeout(() => setPinStatus(false), 3000);
    }
  };

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    setUserName(tempName);
    await updateProfile({ name: tempName });
    setTimeout(() => setIsSaving(false), 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearAll = async () => {
    await superFactoryReset();
    if (session?.user?.id) {
      localStorage.removeItem(getScopedKey(session.user.id, "buildmanager_global_notes"));
    }
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    const res = await deleteAccount();
    if (res.success) {
      signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <ConfirmModal 
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleClearAll}
        title="Nuclear Factory Reset"
        message="DANGER: This will permanently DELETE all projects, workers, tasks, and historical site data. Your account will remain active. Are you sure?"
        confirmText="Confirm Wipe"
      />

      <ConfirmModal 
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Deactivate Protocol"
        message="This is permanent. Your account and all associated site data will be purged. This action cannot be undone."
        confirmText="Delete My Account"
      />

      {/* Forgot Password Modal */}
      <Modal isOpen={isForgotOpen} onClose={() => { setIsForgotOpen(false); setEmailSent(false); }} title="Account Recovery">
         <div className="space-y-6 text-center py-4">
             <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all duration-500 ${emailSent ? 'bg-green-500/20 text-green-500 scale-110 shadow-lg shadow-green-500/20' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
                {emailSent ? <Check size={32} /> : <Mail size={32} />}
             </div>
             <div>
                <h3 className={`text-xl font-bold ${emailSent ? 'text-green-500' : 'text-[var(--foreground)]'}`}>{emailSent ? "Dispatch Successful" : "Reset Password?"}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                   {emailSent 
                     ? <span className="text-green-500 font-bold">A secure recovery link has been architecturaly transmitted. Please check your inbox.</span>
                     : <>We will send a secure recovery link to <span className="text-[var(--foreground)] font-bold">{session?.user?.email}</span>.</>}
                </p>
             </div>
             {!emailSent ? (
               <button 
                 onClick={async () => {
                   setIsSaving(true);
                   await sendResetEmail(session?.user?.email || "");
                   setIsSaving(false);
                   setEmailSent(true);
                 }}
                 disabled={isSaving}
                 className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[var(--accent-primary)]/20"
               >
                  {isSaving ? "Transmitting..." : "Send Recovery Email"}
               </button>
             ) : (
               <div className="space-y-4">
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest animate-pulse">
                     Recovery Vector Active
                  </p>
                  <button 
                    onClick={() => setIsForgotOpen(false)}
                    className="w-full py-4 rounded-2xl bg-[var(--foreground)]/[0.05] border border-[var(--card-border)] text-[var(--foreground)] font-black text-xs uppercase tracking-widest hover:bg-[var(--foreground)]/[0.1] transition-all"
                  >
                     Close Interface
                  </button>
               </div>
             )}
         </div>
      </Modal>

      <header className="mb-12">
        <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tighter">Command Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm font-bold tracking-tight mt-1 uppercase tracking-[0.2em] opacity-60">
           Global configuration for Site Lead identity and environment
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Rail */}
        <nav className="flex flex-col gap-2">
           <button 
             onClick={() => setActiveTab("identity")}
             className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'identity' ? 'bg-[var(--accent-primary)] text-white shadow-xl shadow-[var(--accent-primary)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] border border-transparent'}`}
           >
              <User size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Identity</span>
           </button>
           <button 
             onClick={() => setActiveTab("display")}
             className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'display' ? 'bg-[var(--accent-primary)] text-white shadow-xl shadow-[var(--accent-primary)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] border border-transparent'}`}
           >
              <Palette size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Environment</span>
           </button>
           <button 
             onClick={() => setActiveTab("security")}
             className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'security' ? 'bg-[var(--accent-primary)] text-white shadow-xl shadow-[var(--accent-primary)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] border border-transparent'}`}
           >
              <ShieldCheck size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Security</span>
           </button>
           <div className="h-px bg-[var(--card-border)] my-4" />
           <div className="space-y-1">
             <button 
               onClick={() => setIsResetOpen(true)}
               className="flex items-center gap-3 w-full px-6 py-4 rounded-2xl text-orange-500 hover:bg-orange-500/10 transition-all group"
             >
                <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Factory Reset</span>
             </button>
             <button 
               onClick={() => setIsDeleteAccountOpen(true)}
               className="flex items-center gap-3 w-full px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group"
             >
                <X size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Delete Account</span>
             </button>
           </div>
        </nav>

        {/* Content Area */}
        <div className="lg:col-span-3 min-h-[500px]">
           <div className="window-panel p-10 border border-[var(--card-border)] bg-[var(--foreground)]/[0.01]">
              {activeTab === 'identity' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div>
                      <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight mb-6">Profile Identity</h2>
                      
                      <div className="flex items-center gap-10 bg-[var(--foreground)]/[0.03] p-8 rounded-3xl border border-[var(--card-border)]">
                         <div className="relative group">
                            <label className="cursor-pointer block">
                               <div className="w-24 h-24 rounded-[2rem] bg-[var(--accent-primary)]/20 border-2 border-dashed border-[var(--accent-primary)]/40 flex items-center justify-center text-4xl font-black text-white shadow-2xl overflow-hidden group-hover:border-[var(--accent-primary)] transition-colors">
                                  {typeof avatar === 'string' && avatar.startsWith('data:') ? (
                                    <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                                  ) : (
                                    <div className="opacity-40 grayscale group-hover:grayscale-0 transition-all">{avatar}</div>
                                  )}
                               </div>
                               <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera size={24} className="text-white" />
                               </div>
                               <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </label>
                         </div>
                         
                         <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Site Lead Email</label>
                               <p className="text-[var(--foreground)] font-bold opacity-40">{session?.user?.email ?? 'admin@buildmanager.com'}</p>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">Display Name</label>
                               <div className="flex gap-4">
                                  <input 
                                    className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)] transition-all flex-1"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                  />
                                  <button onClick={handleProfileUpdate} className="px-6 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                                     {isSaving ? <Check size={14} className="animate-bounce" /> : "Update"}
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'display' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div>
                      <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight mb-2">Fleet Environment</h2>
                      <p className="text-xs text-[var(--text-secondary)] mb-8 uppercase font-bold tracking-widest">Configuration of the visual matrix and regional protocols</p>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="bg-[var(--foreground)]/[0.03] p-6 rounded-3xl border border-[var(--card-border)] space-y-6">
                            <div className="flex items-center gap-3">
                               <Palette size={16} className="text-[var(--accent-primary)]" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Visual Mode</span>
                            </div>
                            <div className="flex p-1 bg-[var(--foreground)]/[0.05] rounded-2xl gap-1 border border-[var(--card-border)]">
                               {['dark', 'light'].map((t) => (
                                 <button
                                   key={t}
                                   onClick={() => setTheme(t as any)}
                                   className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === t ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}
                                 >
                                    {t}
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div className="bg-[var(--foreground)]/[0.03] p-6 rounded-3xl border border-[var(--card-border)] space-y-6">
                            <div className="flex items-center gap-3">
                               <Globe size={16} className="text-[var(--accent-primary)]" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Global Currency</span>
                            </div>
                            <div className="flex p-1 bg-[var(--foreground)]/[0.05] rounded-2xl gap-1 border border-[var(--card-border)]">
                               {['EUR', 'USD'].map((c) => (
                                 <button
                                   key={c}
                                   onClick={() => setCurrency(c as any)}
                                   className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currency === c ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'}`}
                                 >
                                    {c === 'EUR' ? 'Euro (€)' : 'Dollar ($)'}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div>
                      <div className="flex items-center justify-between mb-2">
                         <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">
                            {token ? "Authorize New Security Key" : "Access & Security"}
                         </h2>
                         {token && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
                               <ShieldAlert size={12} className="animate-pulse" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Recovery Protocol Active</span>
                            </div>
                         )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mb-10 uppercase font-bold tracking-widest leading-relaxed">
                         {token 
                           ? "Secure verification authorized via recovery token. Type the new password and confirm it below to synchronize." 
                           : "Site Lead access protocols and encryption keys"}
                      </p>
                      
                      <Formik
                        initialValues={token ? { newPassword: "", confirmPassword: "" } : { currentPassword: "", newPassword: "", confirmPassword: "" }}
                        validationSchema={token ? ResetSchema : PasswordSchema}
                        onSubmit={async (values, { resetForm }) => {
                          let result;
                          if (token) {
                            result = await resetPasswordWithToken(token, values.newPassword);
                          } else {
                            result = await updatePassword(values);
                          }

                          if (result.success) {
                            setPasswordStatus({ 
                               type: 'success', 
                               message: token ? 'Password reset achieved. Return to login vector.' : 'Security protocols updated successfully.' 
                            });
                            resetForm();
                            if (token) {
                               setTimeout(() => {
                                  signOut({ callbackUrl: "/login" });
                               }, 3000);
                            }
                            setTimeout(() => setPasswordStatus(null), 5000);
                          } else {
                            setPasswordStatus({ type: 'error', message: result.error || 'System failed to synchronize keys.' });
                            setTimeout(() => setPasswordStatus(null), 5000);
                          }
                        }}
                      >
                         {({ touched, errors, isSubmitting }) => (
                           <Form className="space-y-6 max-w-sm">
                              {!token && (
                                <div className="space-y-2">
                                   <div className="flex justify-between items-end mb-1">
                                      <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest ml-1">Current Password</label>
                                      <button 
                                        type="button" 
                                        onClick={() => setIsForgotOpen(true)}
                                        className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest hover:underline"
                                      >
                                         Forgot Password?
                                      </button>
                                   </div>
                                   <div className="relative">
                                      <Field 
                                        name="currentPassword" 
                                        type="password" 
                                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-12 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                        placeholder="••••••••"
                                        style={{ color: 'var(--foreground)' }}
                                      />
                                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                   </div>
                                   <FormError touched={touched.currentPassword} message={errors.currentPassword as any} />
                                </div>
                              )}

                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest ml-1">New System Password</label>
                                 <Field 
                                   name="newPassword" 
                                   type="password" 
                                   className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                   placeholder="Min 8 characters"
                                   style={{ color: 'var(--foreground)' }}
                                 />
                                 <FormError touched={touched.newPassword} message={errors.newPassword as any} />
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest ml-1">Verify New Password</label>
                                 <Field 
                                   name="confirmPassword" 
                                   type="password" 
                                   className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl px-5 py-4 text-sm text-[var(--foreground)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                                   placeholder="Verify password"
                                   style={{ color: 'var(--foreground)' }}
                                 />
                                 <FormError touched={touched.confirmPassword} message={errors.confirmPassword as any} />
                              </div>

                              <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-[2rem] bg-[var(--accent-primary)] text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[var(--accent-primary)]/20 mt-4"
                              >
                                {isSubmitting ? "Syncing..." : (token ? "Authorize Update" : "Change Password")}
                              </button>

                              {passwordStatus && (
                                <div className={`mt-4 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${passwordStatus.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                   {passwordStatus.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                                   <span className="text-[10px] font-black uppercase tracking-widest">{passwordStatus.message}</span>
                                </div>
                              )}
                           </Form>
                         )}
                      </Formik>
                   </div>

                   <div className="pt-8 border-t border-[var(--card-border)]">
                      <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight mb-2">Privacy Lock Protocol</h2>
                      <p className="text-xs text-[var(--text-secondary)] mb-6 uppercase font-bold tracking-widest leading-relaxed">
                         Configure your 4-character alphanumeric vault key. This code is required to resume from Safety Screen mode.
                      </p>
                      
                      <div className="bg-[var(--foreground)]/[0.03] p-8 rounded-3xl border border-[var(--card-border)] max-w-sm">
                         <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest ml-1 mb-2 block">
                            {hasCustomPin ? "Update Safety PIN" : "Initialize Safety PIN"}
                         </label>
                         <div className="flex gap-4">
                            <input 
                              type="text"
                              maxLength={4}
                              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent-primary)] transition-all flex-1 tracking-[0.5em] font-black text-center"
                              placeholder="A1B2"
                              value={newPin}
                              onChange={(e) => setNewPin(e.target.value.toUpperCase())}
                            />
                            <button 
                              onClick={handlePinUpdate}
                              disabled={newPin.length !== 4}
                              className="px-6 py-3 rounded-xl bg-[var(--accent-primary)] text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                            >
                               Save
                            </button>
                         </div>
                         {pinStatus && (
                           <div className="mt-4 flex items-center gap-2 text-green-500 animate-in fade-in slide-in-from-top-1">
                              <Check size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Vault Key Synchronized</span>
                           </div>
                         )}
                         <p className="mt-4 text-[9px] text-orange-500/70 font-bold uppercase tracking-widest leading-tight">
                            Note: The default recovery code 'pass' remains active for emergency access.
                         </p>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
       <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px]">Synchronizing Command Center...</p>
       </div>
    }>
       <SettingsContent />
    </Suspense>
  );
}
