import React, { useEffect, useRef, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const initialForm = {
  title: "",
  category: "burkha",
  price: "",
  imageUrl: "",
  available: true,
};

export default function Admin({ user, token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0 });
  const [users, setUsers] = useState([]);

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editProductId, setEditProductId] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [pingRes, usersRes, productsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/ping`, { method: "GET", headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/users`, { method: "GET", headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/products`, { method: "GET", headers: authHeaders }),
      ]);

      const pingData = await pingRes.json();
      const usersData = await usersRes.json();
      const productsData = await productsRes.json();

      if (!pingRes.ok) throw new Error(pingData?.error || "Admin verification failed.");
      if (!usersRes.ok) throw new Error(usersData?.error || "Unable to load users.");
      if (!productsRes.ok) throw new Error(productsData?.error || "Unable to load products.");

      setServerMessage(pingData?.message || "Admin access verified.");
      setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
      setStats({
        totalUsers: usersData?.totalUsers || 0,
        totalAdmins: usersData?.totalAdmins || 0,
      });
      setProducts(Array.isArray(productsData?.products) ? productsData.products : []);
    } catch (err) {
      setError(err.message || "Unable to load admin data.");
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
    fetchAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setForm(initialForm);
    setEditProductId("");
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: form.title,
        category: form.category,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        available: Boolean(form.available),
      };

      const endpoint = editProductId
        ? `${API_BASE}/api/admin/products/${editProductId}`
        : `${API_BASE}/api/admin/products`;

      const res = await fetch(endpoint, {
        method: editProductId ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Unable to save product.");

      await fetchAdminData();
      resetForm();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const startEditProduct = (product) => {
    setEditProductId(product.id);
    setForm({
      title: product.title || "",
      category: product.category || "burkha",
      price: String(product.price ?? ""),
      imageUrl: product.imageUrl || "",
      available: product.available !== false,
    });
  };

  const uploadImageFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setUploadingImage(true);
    setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read image file."));
        reader.readAsDataURL(file);
      });
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (err) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProduct = async (id) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to delete product.");
      await fetchAdminData();
      if (editProductId === id) resetForm();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  };

  const toggleAvailability = async (product) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ ...product, available: !product.available }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to update availability.");
      await fetchAdminData();
    } catch (err) {
      setError(err.message || "Unable to update availability.");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white/90 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome, {user?.name || "Admin"} ({user?.email || "authorized user"}).
            </p>
          </div>
          <button
            onClick={fetchAdminData}
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow text-sm"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {!error && (
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

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border bg-white p-4">
                <h2 className="text-lg font-semibold text-gray-900">Add / Edit Product</h2>
                <form onSubmit={submitProduct} className="mt-4 space-y-3">
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Product title"
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    >
                      <option value="burkha">Burkha</option>
                      <option value="hijab">Hijab</option>
                      <option value="shawl">Shawl</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="Price"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Image URL (https://...)"
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={uploadImageFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                    </button>
                    <span className="text-xs text-gray-500">or paste image URL above</span>
                  </div>

                  {form.imageUrl && (
                    <div className="rounded-lg border p-2 w-32 h-32 bg-gray-50 flex items-center justify-center">
                      <img src={form.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}

                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))}
                    />
                    Available for customers
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : editProductId ? "Update Product" : "Add Product"}
                    </button>
                    {editProductId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="rounded-xl border bg-white p-4 overflow-auto">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Products</h2>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Available</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t">
                        <td className="px-3 py-2">{product.title}</td>
                        <td className="px-3 py-2">{product.category}</td>
                        <td className="px-3 py-2">Rs {product.price}</td>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={product.available !== false}
                            onChange={() => toggleAvailability(product)}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditProduct(product)}
                              className="text-blue-700 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="text-red-700 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 rounded-xl border bg-white overflow-hidden">
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
