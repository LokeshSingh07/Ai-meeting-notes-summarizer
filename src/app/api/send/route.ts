import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export async function POST(req: NextRequest) {
    try {
        const { recipients, summary } = await req.json();

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: "Provide at least one recipient." }, { status: 400 });
        }
        
        if (!summary || typeof summary !== "string" || summary.trim().length === 0) {
            return NextResponse.json({ error: "Summary is empty." }, { status: 400 });
        }


        
        const from = process.env.EMAIL_FROM || "no-reply@example.com";

        const html = `
            <div style="font-family: system-ui, Arial, sans-serif; line-height:1.5">
                <h2 style="margin:0 0 8px 0">Meeting Summary</h2>
                <div>${summary
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br/>")}</div>
                <hr style="margin:16px 0"/>
                <div style="font-size:12px;opacity:0.7">Sent via AI Meeting Summarizer</div>
            </div>
        `;

        await resend.emails.send({
            from,
            to: recipients,
            subject: "Meeting Summary",
            html
        });

        return NextResponse.json({ ok: true });
    }
    catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err?.message || "Email send failed." }, { status: 500 });
    }
}
