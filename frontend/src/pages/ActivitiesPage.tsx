import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Card } from "../components/Card";
import { useAuth } from "../auth/AuthContext";
import type { Activity } from "../types/models";
import * as activitiesApi from "../api/activitiesApi";

type FormState = {
  destination: string;
  name: string;
  type: string;
  priceLevel: number | null;
  durationHours: number | null;
};

const emptyForm: FormState = {
  destination: "",
  name: "",
  type: "",
  priceLevel: null,
  durationHours: null,
};

export function ActivitiesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters (client-side to avoid backend param mismatch)
  const [qDestination, setQDestination] = useState("");
  const [qType, setQType] = useState("");

  // create/update
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await activitiesApi.listActivities();
        setActivities(res.activities);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load activities");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const dOk = qDestination
        ? a.destination.toLowerCase().includes(qDestination.toLowerCase())
        : true;
      const tOk = qType
        ? a.type.toLowerCase().includes(qType.toLowerCase())
        : true;
      return dOk && tOk;
    });
  }, [activities, qDestination, qType]);

  function startCreate() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(a: Activity) {
    setMode("edit");
    setEditingId(a.id);
    setForm({
      destination: a.destination,
      name: a.name,
      type: a.type,
      priceLevel: a.priceLevel,
      durationHours: a.durationHours,
    });
  }

  async function onSave() {
    if (form.durationHours === null || form.durationHours <= 0) {
      alert("durationHours must be a number > 0");
      return;
    }

    if (!form.destination.trim() || !form.name.trim() || !form.type.trim()) {
      alert("Destination, name and type are required.");
      return;
    }
    if (
      form.priceLevel === null ||
      !Number.isInteger(form.priceLevel) ||
      form.priceLevel < 1 ||
      form.priceLevel > 5
    ) {
      alert("priceLevel must be an integer 1-5");
      return;
    }

    setSaving(true);
    try {
      const payload: Omit<Activity, "id"> = {
        destination: form.destination.trim(),
        name: form.name.trim(),
        type: form.type.trim(),
        priceLevel: form.priceLevel,
        durationHours: Number(form.durationHours),
      };

      if (mode === "create") {
        const res = await activitiesApi.createActivity(payload);
        setActivities((prev) => [res.activity, ...prev]);
        startCreate();
      } else if (editingId != null) {
        const res = await activitiesApi.updateActivity(editingId, payload);
        setActivities((prev) =>
          prev.map((x) => (x.id === editingId ? res.activity : x)),
        );
        startCreate();
      }
    } catch (e: any) {
      alert(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number) {
    if (!isAdmin) return;
    if (!confirm("Delete this activity?")) return;

    try {
      await activitiesApi.deleteActivity(id);
      setActivities((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Activities</h1>
              <p className="text-sm text-gray-600">
                Manage activity templates (EDITOR/ADMIN). Delete is ADMIN-only.
              </p>
            </div>

            <button
              onClick={startCreate}
              className="rounded-xl bg-black px-4 py-2 font-medium text-white"
            >
              New activity
            </button>
          </div>

          {/* Filters */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-black/10 p-2 outline-none"
              placeholder="Filter by destination..."
              value={qDestination}
              onChange={(e) => setQDestination(e.target.value)}
            />
            <input
              className="rounded-xl border border-black/10 p-2 outline-none"
              placeholder="Filter by type..."
              value={qType}
              onChange={(e) => setQType(e.target.value)}
            />
          </div>

          {/* Create/Edit form */}
          <Card className="mt-6">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {mode === "create"
                  ? "Create activity"
                  : `Edit activity #${editingId}`}
              </div>
              {mode === "edit" && (
                <button
                  onClick={startCreate}
                  className="text-sm rounded-xl border border-black/10 px-3 py-1.5 hover:bg-black/5"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-xl border border-black/10 p-2 outline-none"
                placeholder="Destination"
                value={form.destination}
                onChange={(e) =>
                  setForm((p) => ({ ...p, destination: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-black/10 p-2 outline-none"
                placeholder="Type (e.g. museum)"
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
              />
              <input
                className="rounded-xl border border-black/10 p-2 outline-none sm:col-span-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              <input
                type="number"
                min={1}
                max={5}
                step={1}
                className="rounded-xl border border-black/10 p-2 outline-none"
                placeholder="Price level (1-5)"
                value={form.priceLevel ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    priceLevel:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />

              <input
                type="number"
                className="rounded-xl border border-black/10 p-2 outline-none"
                placeholder="Duration hours"
                value={form.durationHours ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    durationHours:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              />
            </div>

            <button
              onClick={onSave}
              disabled={saving}
              className="mt-4 rounded-xl bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </button>
          </Card>

          {/* List */}
          <div className="mt-6">
            {loading && <Card>Loading activities...</Card>}

            {!loading && error && (
              <Card className="border-red-200 bg-red-50 text-red-700">
                {error}
              </Card>
            )}

            {!loading && !error && filtered.length === 0 && (
              <Card>No activities found.</Card>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="grid gap-4">
                {filtered.map((a) => (
                  <Card key={a.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold">{a.name}</div>
                        <div className="mt-1 text-sm text-gray-600">
                          {a.destination} • {a.type}
                          {a.durationHours ? ` • ${a.durationHours} h` : ""}
                          {` • price ${a.priceLevel}/5`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(a)}
                          className="rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
                        >
                          Edit
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => onDelete(a.id)}
                            className="rounded-xl bg-red-600 px-3 py-1.5 text-sm text-white"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
