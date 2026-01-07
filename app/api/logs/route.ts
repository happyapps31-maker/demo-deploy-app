import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deployLogs } from "@/lib/schema";
import { desc } from "drizzle-orm";

function validateLogInput(data: unknown): {
  valid: boolean;
  message?: string;
  source?: string;
  error?: string;
} {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const { message, source } = data as { message?: string; source?: string };

  if (!message || typeof message !== "string") {
    return { valid: false, error: "Message is required" };
  }

  if (message.length < 1 || message.length > 200) {
    return { valid: false, error: "Message must be 1-200 characters" };
  }

  if (!source || typeof source !== "string") {
    return { valid: false, error: "Source is required" };
  }

  if (source.length < 1 || source.length > 20) {
    return { valid: false, error: "Source must be 1-20 characters" };
  }

  return { valid: true, message: message.trim(), source: source.trim() };
}

export async function GET() {
  try {
    const logs = await db
      .select()
      .from(deployLogs)
      .orderBy(desc(deployLogs.createdAt))
      .limit(50);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateLogInput(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const [newLog] = await db
      .insert(deployLogs)
      .values({
        message: validation.message!,
        source: validation.source!,
      })
      .returning();

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error("Failed to create log:", error);
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}
