// /app/api/invitations/accept/route.ts
import { prisma } from "@/prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

// Prisma via singleton client

export async function POST(req: Request) {
    const { token, password } = await req.json();

    if (!token || !password) {
        return NextResponse.json({ message: "Token and password are required" }, { status: 400 });
    }

    // Find the corresponding invitation
    const invitation = await prisma.cabinetInvitation.findUnique({
        where: { token },
    });

    if (!invitation || invitation.expires < new Date()) {
        return NextResponse.json({ message: "Invitation is invalid or has expired" }, { status: 404 });
    }

    const hashedPassword = await hash(password, 10);

    // Use a transaction to create the new user and delete the invitation atomically
    try {
        await prisma.$transaction(async (tx: any) => {
            await tx.user.create({
                data: {
                    email: invitation.email.toLowerCase().trim(),
                    password: hashedPassword,
                    accountType: "CABINET",
                    role: "MEMBER", // New users join as Members
                    cabinetId: invitation.cabinetId,
                    emailVerified: new Date(),
                },
            });

            await tx.cabinetInvitation.delete({
                where: { id: invitation.id },
            });
        });

        return NextResponse.json({ message: "Account created successfully. You can now log in." }, { status: 201 });

    } catch (error) {
        // Handle cases where the user email might already exist (if they signed up separately)
        return NextResponse.json({ message: "This email address is already in use." }, { status: 409 });
    }
}