"use client";

import { useState } from "react";

export default function Page() {
    const [transcript, setTranscript] = useState("");
    const [instruction, setInstruction] = useState(
        "Summarize in concise bullet points with action items at the end."
    );
    const [summary, setSummary] = useState("");
    const [recipients, setRecipients] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);



    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (file.type === "text/plain") {
                const text = await file.text();
                setTranscript(text);
            }
            else if (
                file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                file.type === "application/msword"
            ){
                setError("DOCX parsing not yet implemented. Convert to .txt for now.");
            }
            else if (file.type === "application/pdf") {
                setError("PDF parsing not yet implemented. Convert to .txt for now.");
            }
            else {
                setError("Unsupported file type. Please upload a .txt file.");
            }
        } 
        catch (err) {
            setError("Failed to read file.");
        }
    }

    async function generate() {
        setError(null);
        setNotice(null);
        setLoading(true);
        try {
            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript, instruction }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setSummary(data.summary || "");
            setNotice("Summary generated. You can edit before sending.");
        }
        catch (e: any) {
            setError(e.message || "Failed to generate summary.");
        }
        finally {
            setLoading(false);
        }
    }

    async function sendEmail() {
        setError(null);
        setNotice(null);
        setSending(true);
        try {
            const emails = recipients
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            const res = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipients: emails, summary }),
            });
            if (!res.ok) throw new Error(await res.text());
            await res.json();
            setNotice("Email sent.");
        }
        catch (e: any) {
            setError(e.message || "Failed to send email.");
        }
        finally {
            setSending(false);
        }
    }




  return (
    <div className="grid gap-4">
      {/* Transcript Input (Paste or Upload) */}
      <label className="grid gap-2">
        <span className="text-sm font-medium">Transcript</span>

        <textarea
          placeholder="Paste the full meeting or call transcript..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={10}
          className="w-full rounded-md border border-gray-700 bg-gray-900 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        />

        <div className="text-xs text-gray-400">Or upload a .txt file:</div>
        <input
          type="file"
          accept=".txt,.doc,.docx,.pdf"
          onChange={handleFileUpload}
          className="text-sm text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-700 file:px-3 file:py-1 file:text-white hover:file:bg-indigo-600"
        />
      </label>


      {/* Instruction input */}
      <label className="grid gap-2">
        <span className="text-sm font-medium">Custom instruction</span>
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='e.g., "Summarize in bullet points for executives"'
          className="w-full rounded-md border border-gray-700 bg-gray-900 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        />
      </label>


      {/* Generate Button */}
      <button
        onClick={generate}
        disabled={loading || !transcript.trim()}
        className={`rounded-md border px-4 py-2 text-white transition ${
          loading || !transcript.trim()
            ? "cursor-not-allowed border-gray-600 bg-gray-700"
            : "border-gray-700 bg-indigo-700 hover:bg-indigo-600"
        }`}
      >
        {loading ? "Generating..." : "Generate Summary"}
      </button>




      {/* Show summary + email section only after generation */}
      {summary && (
        <>
          <label className="grid gap-2 mt-10">
            <span className="text-sm font-medium">Editable summary</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={12}
              className="w-full whitespace-pre-wrap rounded-md border border-gray-700 bg-gray-900 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">
              Recipient emails (comma separated)
            </span>
            <input
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="name@company.com, another@company.com"
              className="w-full rounded-md border border-gray-700 bg-gray-900 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <button
            onClick={sendEmail}
            disabled={sending || !summary.trim() || !recipients.trim()}
            className={`rounded-md border px-4 py-2 text-white transition ${
              sending || !summary.trim() || !recipients.trim()
                ? "cursor-not-allowed border-gray-600 bg-gray-700"
                : "border-gray-700 bg-emerald-700 hover:bg-emerald-600"
            }`}
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
        </>
      )}

      {notice && <div className="text-sm text-emerald-300">{notice}</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="mt-2 text-xs text-gray-400">
        Tip: keep instructions specific, e.g., “3–5 bullets, include decisions,
        owners, due dates.”
      </div>
    </div>
  );
}
