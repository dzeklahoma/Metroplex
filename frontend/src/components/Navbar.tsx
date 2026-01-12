import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function onLogout() {
    await logout();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link to="/trips" className="font-semibold">
          Metroplex
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 text-sm">
            <Link className="hover:underline" to="/trips">
              Trips
            </Link>
            <Link className="hover:underline" to="/trips/new">
              Create Trip
            </Link>
            {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
              <Link className="hover:underline" to="/activities">
                Activities
              </Link>
            )}
          </nav>

          <div className="hidden sm:block text-xs text-gray-600">
            {user?.email} ({user?.role})
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
