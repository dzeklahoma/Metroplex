import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function TripsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function onLogout() {
    await logout();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Trips</h1>
            <p className="text-sm text-gray-600">
              Logged in as{" "}
              <span className="font-medium">
                {user?.email} ({user?.role})
              </span>
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl border border-black/10 px-4 py-2 hover:bg-black/5"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
          Trips listing dolazi u sledećim koracima (GET /api/trips/my).
        </div>
      </div>
    </div>
  );
}
