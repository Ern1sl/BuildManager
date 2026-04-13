"use server";

import { db } from "@/lib/db";
import { hash, compare } from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function updatePassword(formData: any) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const { currentPassword, newPassword } = formData;

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found" };
    }

    // Verify current
    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Incorrect current password" };
    }

    // Hash new
    const hashedPassword = await hash(newPassword, 12);

    await db.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Password update error:", error);
    return { success: false, error: "Failed to update password" };
  }
}

export async function updateProfile(data: { name: string }) {
  try {
    const session = await getSession();
    if (!session?.user?.email) return { success: false };

    await db.user.update({
      where: { email: session.user.email },
      data: { name: data.name },
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
export async function deleteAccount() {
  try {
    const session = await getSession();
    if (!session?.user?.id) return { success: false };

    await db.user.delete({
      where: { id: session.user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Account delete error:", error);
    return { success: false };
  }
}

export async function resetPasswordWithToken(token: string, newPassword: any) {
  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return { success: false, error: "Invalid or expired token" };
    }

    const hashedPassword = await hash(newPassword, 12);

    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({
      where: { token },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "System failure" };
  }
}
