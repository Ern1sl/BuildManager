import { motion, AnimatePresence } from "framer-motion";

interface FormErrorProps {
  message?: string;
  touched?: boolean;
}

export default function FormError({ message, touched }: FormErrorProps) {
  return (
    <AnimatePresence>
      {touched && message && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
          className="text-red-400 text-[9px] font-black uppercase tracking-[0.1em] mt-1.5 pl-1.5 border-l border-red-500/30 ml-0.5"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
