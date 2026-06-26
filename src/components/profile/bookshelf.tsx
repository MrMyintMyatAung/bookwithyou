import { useState, type FormEvent } from "react";
import {
  useBookshelf,
  useAddBookshelfItem,
  useUpdateBookshelfItem,
  useDeleteBookshelfItem,
  STATUS_OPTIONS,
  type BookshelfStatus,
} from "../../hooks/useBookshelf";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function Bookshelf() {
  const { data: items, isLoading } = useBookshelf();
  const addItem = useAddBookshelfItem();
  const updateItem = useUpdateBookshelfItem();
  const deleteItem = useDeleteBookshelfItem();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<BookshelfStatus | "all">("reading");

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newStatus, setNewStatus] = useState<BookshelfStatus>("want_to_read");
  const [addError, setAddError] = useState("");

  // Counts
  const counts = {
    reading: items?.filter((i) => i.status === "reading").length ?? 0,
    want_to_read: items?.filter((i) => i.status === "want_to_read").length ?? 0,
    finished: items?.filter((i) => i.status === "finished").length ?? 0,
    all: items?.length ?? 0,
  };

  // Filter by active tab + search
  const filtered = (items ?? []).filter((item) => {
    const matchTab = activeTab === "all" || item.status === activeTab;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAddError("");
    addItem.mutate(
      {
        title: newTitle.trim(),
        author: newAuthor.trim(),
        status: newStatus,
      },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewAuthor("");
          setNewStatus("want_to_read");
          setShowForm(false);
          setActiveTab(newStatus);
        },
        onError: (err) => setAddError(err instanceof Error ? err.message : "Failed to add."),
      }
    );
  };

  const tabs: { key: BookshelfStatus | "all"; label: string }[] = [
    { key: "reading", label: "Reading" },
    { key: "want_to_read", label: "Want to Read" },
    { key: "finished", label: "Finished" },
  ];

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-gray-100">
          My Bookshelf
        </h2>
        <Button
          size="sm"
          variant={showForm ? "secondary" : "primary"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Book"}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-700">
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <Input
              label="Book Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Dune"
              required
              disabled={addItem.isPending}
            />
            <Input
              label="Author"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder="e.g. Frank Herbert"
              disabled={addItem.isPending}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as BookshelfStatus)}
                className="px-3 py-2 rounded-xl border bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 border-slate-300 dark:border-gray-600 text-sm"
                disabled={addItem.isPending}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          {addError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">{addError}</p>
          )}
          <Button type="submit" size="sm" loading={addItem.isPending}>
            Add to Bookshelf
          </Button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-slate-200 dark:border-gray-700 pb-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
              ${activeTab === tab.key
                ? "text-coral-500 border-b-2 border-coral-500 -mb-[2px]"
                : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300"
              }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-slate-400 dark:text-gray-500">
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or author…"
          className="w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 border-slate-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-3xl mb-3">
            {search ? "🔍" : activeTab === "reading" ? "📖" : activeTab === "want_to_read" ? "📚" : "🏁"}
          </div>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            {search
              ? "No matching books found."
              : activeTab === "reading"
                ? "No books in progress. Add one above!"
                : activeTab === "want_to_read"
                  ? "Your reading wishlist is empty."
                  : "No finished books yet."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-gray-800">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-gray-100 truncate">
                  {item.title}
                </p>
                {item.author && (
                  <p className="text-xs text-slate-500 dark:text-gray-400">{item.author}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={item.status}
                  onChange={(e) =>
                    updateItem.mutate({ id: item.id, status: e.target.value as BookshelfStatus })
                  }
                  className="text-xs px-2 py-1 rounded-lg border bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-600"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => deleteItem.mutate(item.id)}
                  className="p-1 rounded-md text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                  aria-label={`Remove "${item.title}"`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
