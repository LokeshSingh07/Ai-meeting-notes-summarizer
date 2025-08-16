import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export async function POST(req: NextRequest) {
    try {
        const { transcript, instruction } = await req.json();

        if (!transcript || typeof transcript !== "string" || transcript.trim().length < 10) {
        return NextResponse.json({ error: "Transcript is required and should be at least 10 characters." }, { status: 400 });
        }

        const userInstruction = (instruction && typeof instruction === "string" ? instruction : "").slice(0, 500);

       
        const trimmedTranscript = transcript.length > 15000 ? transcript.slice(0, 15000) + "\n\n[TRUNCATED]" : transcript;

        const sysPrompt = `You are an expert meeting-notes summarizer.
            - Follow the user's instruction exactly.
            - Prefer clear markdown with headings.
            - Be concise, factual, and actionable.
            - Include Action Items (who/what/when) if asked.
            - Never include raw prompt engineering or meta talk; output only the summary.`;


        const userPrompt = `INSTRUCTION:\n${userInstruction || "Summarize clearly in bullet points and list action items at the end."}\n\nTRANSCRIPT:\n${trimmedTranscript}`;


        const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
        });

        const content = completion.choices?.[0]?.message?.content || "";

        return NextResponse.json({ summary: content.trim() });
    }
    catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err?.message || "Summarization failed." }, { status: 500 });
    }
}
