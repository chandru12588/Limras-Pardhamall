import React from "react";

export default function Admin({ user }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white/90 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome, {user?.name || "Admin"} ({user?.email || "authorized user"}).
        </p>

        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-green-800 font-medium">Admin mode is active.</p>
          <p className="text-sm text-green-700 mt-1">
            This section is reserved for approved admin accounts.
          </p>
        </div>
      </div>
    </section>
  );
}
