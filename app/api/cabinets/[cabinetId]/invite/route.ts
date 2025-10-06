// /app/api/cabinets/[cabinetId]/invite/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { ResendAdapter } from "@/src/infrastructure/email/ResendAdapter";
import { logger } from "@/src/shared/logger";

// In a real app, you would use a service like Resend or Nodemailer
// import { sendInvitationEmail } from '@/lib/email'; 

// Prisma via singleton client

export async function POST(req: Request, { params }: { params: { cabinetId: string } }) {
    const session = await getServerSession(authOptions);

    // Authorization: Ensure the user is an admin of this specific cabinet
    if (
        !session ||
        session.user.accountType !== "CABINET" ||
        session.user.role !== "ADMIN" ||
        session.user.cabinetId !== params.cabinetId
    ) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { email: inviteeEmail } = await req.json();

    if (!inviteeEmail) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    try {
        // Prevent inviting a user who is already in the cabinet
        const existingUser = await prisma.user.findFirst({
            where: { email: inviteeEmail, cabinetId: params.cabinetId }
        });

        if (existingUser) {
            return NextResponse.json({ message: "User is already a member of this cabinet" }, { status: 409 });
        }

        const token = randomBytes(32).toString("hex");
        const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

        // Store the invitation
        await prisma.cabinetInvitation.create({
            data: {
                email: inviteeEmail,
                token,
                expires,
                cabinetId: params.cabinetId,
            },
        });

        // Compose the invitation link (always return it to the client)
        const invitationLink = `${process.env.NEXTAUTH_URL}/accept-invitation?token=${token}`;
        const mailer = new ResendAdapter();
        const sent = await mailer.sendEmail({
            to: inviteeEmail,
            subject: "You're invited to join a cabinet",
            html: `<p>You have been invited to join a cabinet.</p><p><a href="${invitationLink}">Click here to accept the invitation</a></p>`
        });
        if (!sent) {
            logger.warn("Invitation email failed to send", { inviteeEmail, cabinetId: params.cabinetId });
            return NextResponse.json({ message: "Invitation created but email delivery issue detected. Share the link manually if needed.", link: invitationLink }, { status: 200 });
        }

        return NextResponse.json({ message: "Invitation sent successfully", link: invitationLink }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "An error occurred while sending the invitation" }, { status: 500 });
    }
}