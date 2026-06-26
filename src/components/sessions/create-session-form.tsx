import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSession } from "../../hooks/useSessions";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { SessionVisibility } from "../../types/database";

function parseChapters(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function CreateSessionForm() {
  const navigate = useNavigate();
  const createSession = useCreateSession();

  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<SessionVisibility>("public");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [chaptersRaw, setChaptersRaw] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = "Session title is required.";
    if (!bookTitle.trim()) errors.bookTitle = "Book title is required.";
    if (!bookAuthor.trim()) errors.bookAuthor = "Author name is required.";

    const chapters = parseChapters(chaptersRaw);
    if (chapters.length === 0) {
      errors.chapters = "Add at least one chapter.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    const chapters = parseChapters(chaptersRaw);

    createSession.mutate(
      {
        title: title.trim(),
        visibility,
        bookTitle: bookTitle.trim(),
        bookAuthor: bookAuthor.trim(),
        chapters,
      },
      {
        onSuccess: (session) => {
          navigate(`/sessions/${session.id}`, { replace: true });
        },
        onError: (err) => {
          setServerError(
            err instanceof Error ? err.message : "Something went wrong. Please try again."
          );
        },
      }
    );
  };

  const isLoading = createSession.isPending;

  return (
    <div className="min-h-[80vh] flex items-start justify-center px-4 py-8 sm:py-16">
      <Card className="w-full max-w-xl p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900 dark:text-gray-100">
            Start a Reading Session
          </h1>
          <p className="mt-2 text-slate-500 dark:text-gray-400">
            Choose a book, list the chapters, and invite friends to read along.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {serverError && (
            <div
              className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {serverError}
            </div>
          )}

          {/* Session details */}
          <fieldset disabled={isLoading} className="flex flex-col gap-5">
            <legend className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Session
            </legend>

            <Input
              label="Session Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Summer Reading: Dune"'
              error={fieldErrors.title}
              required
            />

            {/* Visibility selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                Visibility
              </label>
              <div className="flex gap-3">
                {(["public", "private"] as SessionVisibility[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setVisibility(opt)}
                    aria-pressed={visibility === opt}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 ${
                      visibility === opt
                        ? "border-coral-300 bg-coral-50 dark:bg-coral-950/40 text-coral-600 dark:text-coral-400"
                        : "border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    {opt === "public" ? "Public" : "Private"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                {visibility === "public"
                  ? "Anyone can find and join this session."
                  : "Only people with the link can join."}
              </p>
            </div>
          </fieldset>

          {/* Book details */}
          <fieldset disabled={isLoading} className="flex flex-col gap-5">
            <legend className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Book
            </legend>

            <Input
              label="Book Title"
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="e.g. Dune"
              error={fieldErrors.bookTitle}
              required
            />

            <Input
              label="Author"
              type="text"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              placeholder="e.g. Frank Herbert"
              error={fieldErrors.bookAuthor}
              required
            />

            {/* Chapters */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="chapters"
                className="text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                Chapters
              </label>
              <textarea
                id="chapters"
                value={chaptersRaw}
                onChange={(e) => setChaptersRaw(e.target.value)}
                placeholder={`Prologue\nCh. 1: The Beginning\nCh. 2: The Road Ahead`}
                rows={6}
                className={`px-3 py-2 rounded-xl border bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-y ${
                  fieldErrors.chapters
                    ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                    : "border-slate-300 dark:border-gray-700"
                }`}
                aria-invalid={fieldErrors.chapters ? "true" : undefined}
                aria-describedby={
                  fieldErrors.chapters ? "chapters-error" : undefined
                }
              />
              {fieldErrors.chapters ? (
                <p
                  id="chapters-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {fieldErrors.chapters}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-gray-500">
                  Enter one chapter per line. Add as many as you want.
                </p>
              )}
            </div>
          </fieldset>

          <Button
            type="submit"
            size="lg"
            loading={isLoading}
            className="w-full mt-2"
          >
            {isLoading ? "Creating session…" : "Create Session"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
