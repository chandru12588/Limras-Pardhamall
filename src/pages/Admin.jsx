import React, { useEffect, useRef, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

const initialForm = {
  title: "",
  category: "burkha",
  price: "",
  imageUrl: "",
  videoUrl: "",
  available: true,
};

const ORDER_STATUSES = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

export default function Admin({ user, token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  const [userStats, setUserStats] = useState({ totalUsers: 0, totalAdmins: 0 });
  const [orderStats, setOrderStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editProductId, setEditProductId] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const [pingRes, usersRes, productsRes, ordersRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/ping`, { method: "GET", headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/users`, { method: "GET", headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/products`, { method: "GET", headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/orders`, { method: "GET", headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/orders/metrics`, { method: "GET", headers: authHeaders }),
      ]);

      const pingData = await pingRes.json();
      const usersData = await usersRes.json();
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const metricsData = await metricsRes.json();

      if (!pingRes.ok) throw new Error(pingData?.error || "Admin verification failed.");
      if (!usersRes.ok) throw new Error(usersData?.error || "Unable to load users.");
      if (!productsRes.ok) throw new Error(productsData?.error || "Unable to load products.");
      if (!ordersRes.ok) throw new Error(ordersData?.error || "Unable to load orders.");
      if (!metricsRes.ok) throw new Error(metricsData?.error || "Unable to load order metrics.");

      setServerMessage(pingData?.message || "Admin access verified.");
      setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
      setUserStats({
        totalUsers: usersData?.totalUsers || 0,
        totalAdmins: usersData?.totalAdmins || 0,
      });
      setProducts(Array.isArray(productsData?.products) ? productsData.products : []);
      setOrders(Array.isArray(ordersData?.orders) ? ordersData.orders : []);
      setOrderStats({
        totalOrders: metricsData?.totalOrders || 0,
        totalRevenue: metricsData?.totalRevenue || 0,
        pendingOrders: metricsData?.pendingOrders || 0,
        deliveredOrders: metricsData?.deliveredOrders || 0,
      });
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
      if (!String(form.imageUrl || "").trim()) {
        throw new Error("Please upload a product image.");
      }

      const payload = {
        title: form.title,
        category: form.category,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        videoUrl: form.videoUrl,
        available: Boolean(form.available),
      };

      const endpoint = editProductId ? `${API_BASE}/api/admin/products/${editProductId}` : `${API_BASE}/api/admin/products`;

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
      videoUrl: product.videoUrl || "",
      available: product.available !== false,
    });
  };

  const uploadMediaFile = async (event, kind) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (kind === "image" && !file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (kind === "video" && !file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }

    if (kind === "image") setUploadingImage(true);
    if (kind === "video") setUploadingVideo(true);
    setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to read image file."));
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API_BASE}/api/admin/uploads`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          fileData: dataUrl,
          fileName: file.name,
          resourceType: kind,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Cloudinary upload failed.");

      if (kind === "image") {
        setForm((prev) => ({ ...prev, imageUrl: data.secureUrl || "" }));
      } else {
        setForm((prev) => ({ ...prev, videoUrl: data.secureUrl || "" }));
      }
    } catch (err) {
      setError(err.message || "Failed to upload file.");
    } finally {
      if (kind === "image") setUploadingImage(false);
      if (kind === "video") setUploadingVideo(false);
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

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to update order status.");
      await fetchAdminData();
    } catch (err) {
      setError(err.message || "Unable to update order status.");
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
          <button onClick={fetchAdminData} className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow text-sm" disabled={loading}>
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

            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-gray-500">Total orders</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.totalOrders}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs {orderStats.totalRevenue}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-gray-500">Pending orders</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.pendingOrders}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-gray-500">Delivered orders</p>
                <p className="text-2xl font-bold text-gray-900">{orderStats.deliveredOrders}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-gray-500">Total users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers}</p>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-gray-500">Admin users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalAdmins}</p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border bg-white p-4 overflow-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Management</h2>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-3 py-2">Order ID</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Items</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t align-top">
                      <td className="px-3 py-2 text-xs">{order.id}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {(order.items || []).map((item) => `${item.title} x${item.quantity}`).join(", ")}
                      </td>
                      <td className="px-3 py-2">Rs {order.totalAmount}</td>
                      <td className="px-3 py-2">
                        <select
                          className="border rounded px-2 py-1"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && <p className="text-sm text-gray-500 mt-3">No online orders yet.</p>}
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

                  <div className="flex items-center gap-2">
                    <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => uploadMediaFile(e, "image")} className="hidden" />
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={(e) => uploadMediaFile(e, "video")} className="hidden" />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm"
                      disabled={uploadingVideo}
                    >
                      {uploadingVideo ? "Uploading..." : "Upload Video"}
                    </button>
                    <span className="text-xs text-gray-500">Upload files only. URLs are disabled for safety.</span>
                  </div>

                  {form.imageUrl && (
                    <div className="rounded-lg border p-2 w-32 h-32 bg-gray-50 flex items-center justify-center">
                      <img src={form.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  {form.videoUrl && (
                    <div className="rounded-lg border p-2 w-48 h-32 bg-gray-50 flex items-center justify-center">
                      <video src={form.videoUrl} controls className="max-w-full max-h-full object-contain" />
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
                    <button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg" disabled={saving}>
                      {saving ? "Saving..." : editProductId ? "Update Product" : "Add Product"}
                    </button>
                    {editProductId && (
                      <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
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
                          <input type="checkbox" checked={product.available !== false} onChange={() => toggleAvailability(product)} />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEditProduct(product)} className="text-blue-700 hover:underline">
                              Edit
                            </button>
                            <button type="button" onClick={() => removeProduct(product.id)} className="text-red-700 hover:underline">
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
