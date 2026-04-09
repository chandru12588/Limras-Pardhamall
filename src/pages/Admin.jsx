import React, { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export default function Admin({ user, token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0 });
  const [users, setUsers] = useState([]);

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [pingRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/ping`, { method: "GET", headers }),
        fetch(`${API_BASE}/api/admin/users`, { method: "GET", headers }),
      ]);

      const pingData = await pingRes.json();
      const usersData = await usersRes.json();

      if (!pingRes.ok) {
        setError(pingData?.error || "Admin verification failed.");
        return;
      }

      if (!usersRes.ok) {
        setError(usersData?.error || "Unable to load admin users.");
        return;
      }

      setServerMessage(pingData?.message || "Admin access verified.");
      setStats({
        totalUsers: usersData?.totalUsers || 0,
        totalAdmins: usersData?.totalAdmins || 0,
      });
      setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
    } catch {
      setError("Backend is not reachable. Start limras-backend and refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Missing auth token. Please login again.");
      setLoading(false);
      return;
    }
    loadAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white/90 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome, {user?.name || "Admin"} ({user?.email || "authorized user"}).
            </p>
          </div>
          <button
            onClick={loadAdminData}
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow text-sm"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-green-800 font-medium">Admin mode is active.</p>
              <p className="text-sm text-green-700 mt-1">{serverMessage}</p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-gray-500">Total users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-gray-500">Admin users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border bg-white overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">Registered users</h2>
              </div>

              {users.length === 0 ? (
                <p className="p-4 text-sm text-gray-600">No users found yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-3 text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-gray-700">{item.email}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">
                              {item.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
