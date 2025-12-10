import { findMemberByUsername, findUserByEmail } from "./userService";
import {
  comparePasswords,
  generateRandomPassword,
  hashPassword,
} from "../utils/password";
import { generateToken } from "../utils/jwt";
import { prisma } from "../config/database";
import { LoginData, UserLoginData } from "../types";
import { Role, UserStatus, MemberStatus } from "@prisma/client";
import { sendOTPEmail } from "../utils/emailTransporter";
import { generateOTP } from "../utils/functions";

export const authenticateMember = async (loginData: LoginData) => {
  const member = await findMemberByUsername(loginData.username);
  if (!member) {
    throw new Error("Invalid credentials");
  }
  if (!member.password) {
    throw new Error(
      "Account not activated. Please contact administrator for password setup."
    );
  }
  if (member.status === MemberStatus.INACTIVE) {
    throw new Error(
      "Your account is not active. Please contact the administrator."
    );
  }
  const isPasswordValid = await comparePasswords(
    loginData.password,
    member.password
  );
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }
  const token = generateToken({
    id: member.id,
    role: member.role,
  });

  return {
    token,
    user: {
      id: member.id,
      email: member.email,
      full_name: member.full_name,
      role: member.role,
    },
  };
};

export const authenticateUser = async (loginData: UserLoginData) => {
  const user = await findUserByEmail(loginData.email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.password) {
    throw new Error("Password is required");
  }

  if (user.status === UserStatus.INACTIVE) {
    throw new Error(
      "You have been suspended, your account is currently inactive"
    );
  }

  const isPasswordValid = await comparePasswords(
    loginData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
};

export const changePassword = async (data: {
  memberId: string;
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
    });

    if (!member || !member.password) {
      throw new Error("User not found");
    }
    const isOldPasswordValid = await comparePasswords(
      data.oldPassword,
      member.password
    );

    if (!isOldPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    const hashedNewPassword = await hashPassword(data.newPassword);

    await prisma.member.update({
      where: { id: data.memberId },
      data: {
        password: hashedNewPassword,
      },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
export const sendPasswordResetOtp = async (email: string) => {
  const [member, user] = await Promise.all([
    prisma.member.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (!member && !user) {
    throw new Error("Email not found");
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const isMember = !!member;
  const userId = member ? member.id : user?.id;

  if (!userId) {
    throw new Error("User ID not found");
  }

  await prisma.passwordReset.deleteMany({
    where: { email },
  });

  await prisma.passwordReset.create({
    data: {
      email,
      token: otp,
      expiresAt,
      used: false,
      userType: isMember ? Role.MEMBER : user?.role || Role.STAFF,
      ...(isMember && { memberId: member.id }),
    },
  });

  await sendOTPEmail(email, otp);

  return { success: true, message: "OTP sent successfully" };
};

export const verifyResetOtp = async (email: string, otp: string) => {
  const record = await prisma.passwordReset.findFirst({
    where: {
      email,
      token: otp,
      expiresAt: { gt: new Date() },
      used: false,
    },
  });

  if (!record) {
    throw new Error("Invalid or expired OTP");
  }

  return {
    success: true,
    isMember: record.userType === Role.MEMBER,
    message: "OTP verified successfully",
  };
};

export const updatePassword = async (
  email: string,
  newPassword: string,
  isMember: boolean
) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    if (isMember) {
      await tx.member.update({
        where: { email },
        data: { password: hashedPassword },
      });
    } else {
      await tx.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
    }

    await tx.passwordReset.updateMany({
      where: { email },
      data: { used: true },
    });
  });

  return { success: true, message: "Password updated successfully" };
};

export const cleanupExpiredOtps = async () => {
  await prisma.passwordReset.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
    },
  });
};
