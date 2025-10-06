// /app/api/invitations/verify/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// This endpoint is used by the frontend to check if a token is valid before showing the form
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ message: "Invitation token is required" }, { status: 400 });
    }

    const invitation = await prisma.cabinetInvitation.findUnique({
        where: { token },
    });

    if (!invitation || invitation.expires < new Date()) {
        return NextResponse.json({ message: "Invitation is invalid or has expired" }, { status: 404 });
    }

    return NextResponse.json({ message: "Token is valid" }, { status: 200 });
}