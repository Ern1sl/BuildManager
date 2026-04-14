"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getScopedKey } from "@/lib/storage";
import AlarmNotification from "./AlarmNotification";

export default function GlobalAlarmManager() {
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [activeAlarmTime, setActiveAlarmTime] = useState("");
  const [activeAlarmNote, setActiveAlarmNote] = useState("");
  const alarmFiredThisMinute = useRef(false);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const timer = setInterval(() => {
      if (!userId) return;

      const configStr = localStorage.getItem(getScopedKey(userId, "buildmanager_alarmConfig"));
      if (!configStr) return;
      
      try {
        const config = JSON.parse(configStr);
        if (!config.hour || !config.min || config.enabled === false) return;

        const now = new Date();
        const currentH = now.getHours();
        const currentM = now.getMinutes();

        let targetH = parseInt(config.hour);
        const targetM = parseInt(config.min);

        if (config.period === "PM" && targetH !== 12) targetH += 12;
        if (config.period === "AM" && targetH === 12) targetH = 0;

        if (currentH === targetH && currentM === targetM) {
          if (!alarmFiredThisMinute.current) {
            alarmFiredThisMinute.current = true;
            setActiveAlarmTime(`${config.hour}:${config.min} ${config.period}`);
            setActiveAlarmNote(config.note || "Scheduled Alarm");
            setIsAlarmActive(true);
          }
        } else {
          alarmFiredThisMinute.current = false;
        }
      } catch (e) {
        console.error("Failed to parse alarm config in background", e);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [userId]);

  // Continuous Alarm Chime Logic
  useEffect(() => {
    let chimeInterval: NodeJS.Timeout;
    
    if (isAlarmActive) {
      const playChime = () => {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // Soft "Ding" (C5)
          
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05); // Faster attack
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5); // Smoother decay

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 1.6);
        } catch (e) {
          console.error("Audio trigger failed:", e);
        }
      };

      playChime(); // Play immediately when active
      chimeInterval = setInterval(playChime, 2500); // Repeat every 2.5 seconds
    }

    return () => {
      if (chimeInterval) clearInterval(chimeInterval);
    };
  }, [isAlarmActive]);

  if (!isAlarmActive) return null;

  return (
    <AlarmNotification 
      isOpen={isAlarmActive} 
      onDismiss={() => setIsAlarmActive(false)} 
      alarmTime={activeAlarmTime} 
      message={activeAlarmNote}
    />
  );
}
