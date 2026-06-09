import { NextResponse } from "next/server";
import { getDefaultLanguage } from "@/lib/site-settings";

export async function GET() {
  const defaultLanguage = await getDefaultLanguage();
  return NextResponse.json({ defaultLanguage });
}
