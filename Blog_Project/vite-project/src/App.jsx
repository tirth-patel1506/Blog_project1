import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:3001/blogs";
const getUser = () => JSON.parse(localStorage.getItem("currentUser"));

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#1e1b2e"/><text x="50%" y="50%" fill="#6b6589" font-size="20" font-family="Arial" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>`
  );

// Show a placeholder if an image URL fails to load
const onImgError = (e) => {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER;
};

/* ---------- Login (any email / password works) ---------- */
function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const found = users.find((u) => u.email === email);
    // If the email is not registered, create a user from the email
    const user = found || { id: Date.now(), name: email.split("@")[0] || "User", email };
    localStorage.setItem("currentUser", JSON.stringify(user));
    navigate("/blogs");
  };

  return (
    <div className="split">
      <div className="split-hero">
        <h1>Write.<br />Share.<br />Inspire.</h1>
        <p>Apni stories aur ideas ko ek jagah manage karo.</p>
      </div>
      <div className="split-form">
        <form onSubmit={handleSubmit} className="auth-box">
          <h2>Welcome back</h2>
          <span className="sub">Login karke aage badho</span>
          <label>Email</label>
          <input type="text" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          <button className="btn btn-gradient">Login</button>
          <p className="switch">Account nahi hai? <Link to="/register">Register</Link></p>
        </form>
      </div>
    </div>
  );
}

/* ---------- Register ---------- */
function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    // Remove any older account with the same email, then save the new one
    const users = (JSON.parse(localStorage.getItem("users")) || []).filter((u) => u.email !== email);
    users.push({ id: Date.now(), name: form.name.trim(), email, password: form.password });
    localStorage.setItem("users", JSON.stringify(users));
    navigate("/login");
  };

  return (
    <div className="split">
      <div className="split-hero">
        <h1>Join<br />the<br />community.</h1>
        <p>Ek minute mein account banao aur blogging shuru karo.</p>
      </div>
      <div className="split-form">
        <form onSubmit={handleSubmit} className="auth-box">
          <h2>Create account</h2>
          <span className="sub">Bas kuch details chahiye</span>
          <label>Name</label>
          <input type="text" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
          <label>Email</label>
          <input type="text" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          <label>Password</label>
          <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          <button className="btn btn-gradient">Register</button>
          <p className="switch">Pehle se account hai? <Link to="/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}

/* ---------- Blogs (CRUD with axios) ---------- */
const emptyForm = { name: "", image: "", description: "" };

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getUser();

  // READ: get all blogs
  const fetchBlogs = async () => {
    try {
      const res = await axios.get(API);
      setBlogs(res.data);
      setError("");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not connect to the server. Start json-server (port 3001).");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  // CREATE or UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: form.name.trim(),
      image: form.image.trim(),
      description: form.description.trim(),
      author: user.name,
    };
    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, data);
      } else {
        await axios.post(API, data);
      }
      resetForm();
      fetchBlogs();
    } catch (err) {
      console.error("Save error:", err);
      setError("Could not save the blog. Check that json-server is running (port 3001).");
    }
  };

  // Fill the form with the blog data to edit it
  const handleEdit = (blog) => {
    setForm({ name: blog.name, image: blog.image, description: blog.description });
    setEditId(blog.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this blog?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Could not delete the blog. Check that json-server is running (port 3001).");
    }
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <>
      <header className="topbar">
        <span className="logo">✦ BlogSpace</span>
        <div className="topbar-right">
          <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
          <span className="uname">{user.name}</span>
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <form onSubmit={handleSubmit} className="panel">
            <h3>{editId ? "✏️ Edit Blog" : "➕ New Blog"}</h3>
            {error && <div className="alert">{error}</div>}
            <input type="text" name="name" placeholder="Blog Name" value={form.name} onChange={handleChange} required />
            <input type="text" name="image" placeholder="Image URL (https://...)" value={form.image} onChange={handleChange} required />
            {form.image && <img src={form.image} alt="preview" className="preview" onError={onImgError} />}
            <textarea name="description" rows={4} placeholder="Description" value={form.description} onChange={handleChange} required />
            <div className="row">
              <button className="btn btn-gradient">{editId ? "Update" : "Add Blog"}</button>
              {editId && (
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </aside>

        <main className="content">
          <h2 className="heading">All Blogs <span className="count">{blogs.length}</span></h2>
          {blogs.length === 0 && !error && <p className="empty">No blogs yet.</p>}

          <div className="cards">
            {blogs.map((b) => (
              <article className="card" key={b.id}>
                <div className="card-img">
                  <img src={b.image} alt={b.name} onError={onImgError} />
                  <div className="card-btns">
                    <button className="chip chip-edit" onClick={() => handleEdit(b)}>Edit</button>
                    <button className="chip chip-del" onClick={() => handleDelete(b.id)}>Delete</button>
                  </div>
                </div>
                <div className="card-text">
                  <h4>{b.name}</h4>
                  <p>{b.description}</p>
                  <span className="by">✍ {b.author}</span>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

/* ---------- Protected route + App ---------- */
function ProtectedRoute({ children }) {
  return getUser() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/blogs" element={<ProtectedRoute><Blogs /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}