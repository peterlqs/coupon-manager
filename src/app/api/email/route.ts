import { EmailTemplate } from "@/components/emails/FirstEmail";
import { resend } from "@/lib/email/index";
import { emailSchema } from "@/lib/email/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, message, subject } = emailSchema.parse(body);
  try {
    const data = await resend.emails.send({
      from: "Quan Ng <hi@longquan.me>",
      to: [email],
      subject: subject,

      react: EmailTemplate({ message: message }),
      text: "Email powered by Resend.",
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
