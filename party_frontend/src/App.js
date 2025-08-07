import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

// Theme color variables for easy use
const palette = {
  primary: "#2D9CDB",
  secondary: "#56CCF2",
  accent: "#27AE60",
};

/* ========== API Helper (Placeholder) ========== */
// Will connect to backend API at /api or as configured in future
const api = {
  login: async (email, password) => {
    // Replace with backend endpoint
    return email === "demo@demo.com" && password === "password"
      ? { token: "mocked-jwt-token", user: { email } }
      : null;
  },
  signup: async (email, password) => {
    // Replace with real call
    if (!/\S+@\S+\.\S+/.test(email)) return { error: "Invalid email" };
    return { success: true };
  },
  getEvents: async (token) => {
    // Replace with real call
    return [
      {
        id: "1",
        title: "Garden Party",
        date: "2024-06-10",
        time: "17:00",
        location: "Central Park",
        description: "Outdoor event with friends and family.",
        host: "Alice",
        guests: [
          { name: "Bob", rsvp: "yes" },
          { name: "Cathy", rsvp: "maybe" },
        ],
      },
      {
        id: "2",
        title: "Birthday Bash",
        date: "2024-06-22",
        time: "20:00",
        location: "789 City Rd",
        description: "Celebrate Steve's big day.",
        host: "Steve",
        guests: [
          { name: "Alice", rsvp: "no" },
          { name: "Bob", rsvp: "yes" },
        ],
      },
    ];
  },
  getEvent: async (id, token) => {
    // For mocking, return mock event
    return (
      (await api.getEvents(token)).find((e) => e.id === id) || null
    );
  },
  createEvent: async (event, token) => {
    // Placeholder
    return { success: true, id: "NEW_EVENT_ID" };
  },
  updateEvent: async (id, event, token) => {
    return { success: true };
  },
  // Other endpoints (invite, RSVP, guestlist, etc.) would be similar
};

/* =========== Contexts ============ */
const AuthContext = React.createContext();

// AuthProvider maintains login state
function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    const res = await api.login(email, password);
    setLoading(false);
    if (res && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);
      return { success: true };
    }
    return { error: "Invalid credentials" };
  };

  const signup = async (email, password) => api.signup(email, password);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ========== UI COMPONENTS ========== */

/* PUBLIC_INTERFACE
 * Navbar - Top navigation bar with links, logo, and auth actions.
 */
function Navbar() {
  const { user, logout } = React.useContext(AuthContext);
  const location = useLocation();
  return (
    <nav
      style={{
        background: palette.primary,
        color: "#fff",
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Link
          to="/"
          style={{
            color: "#fff",
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: "1.35rem",
          }}
        >
          🥳 Party Planner
        </Link>
      </div>
      <div style={{ flex: 1, marginLeft: "1.5rem" }}>
        {user && (
          <>
            <NavLinkBtn to="/events" selected={location.pathname.startsWith("/events")}>
              Events
            </NavLinkBtn>
            <NavLinkBtn to="/events/new" selected={location.pathname === "/events/new"}>
              Create Event
            </NavLinkBtn>
          </>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: "1rem", fontSize: "1rem" }}>
              Hi, {user.email}
            </span>
            <button
              onClick={logout}
              style={{
                background: palette.accent,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLinkBtn to="/login">Login</NavLinkBtn>
            <NavLinkBtn to="/signup">Sign up</NavLinkBtn>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLinkBtn({ to, children, selected }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        marginRight: 18,
        color: "#fff",
        opacity: selected ? 1 : 0.85,
        fontWeight: selected ? "bold" : 500,
        borderBottom: selected ? `2.5px solid ${palette.secondary}` : "none",
        paddingBottom: 2,
        fontSize: "1.05rem",
        transition: "opacity 0.2s",
      }}
    >
      {children}
    </Link>
  );
}

// Simple form field
function Field({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontWeight: 500, display: "block", marginBottom: 5 }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: "100%",
          border: "1px solid #e1e6ea",
          borderRadius: 6,
          padding: "9px 12px",
          fontSize: "1rem",
          margin: 0,
        }}
      />
    </div>
  );
}

function Feedback({ error, success }) {
  if (error)
    return (
      <div
        style={{
          background: "#fbe4e7",
          color: "#ce2853",
          padding: "8px 12px",
          borderRadius: 5,
          marginBottom: 14,
        }}
      >
        {error}
      </div>
    );
  if (success)
    return (
      <div
        style={{
          background: "#e4faf1",
          color: palette.accent,
          padding: "8px 12px",
          borderRadius: 5,
          marginBottom: 14,
        }}
      >
        {success}
      </div>
    );
  return null;
}

/* ========== AUTH SCREENS ========== */
// PUBLIC_INTERFACE
function LoginScreen() {
  const { login, loading } = React.useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(email, password);
    if (res.error) setError(res.error);
    else navigate("/events");
  };

  return (
    <CenteredContainer>
      <form onSubmit={handleSubmit} style={{ width: 320, maxWidth: "96%" }}>
        <h2>Login</h2>
        <Field
          label="Email"
          name="email"
          type="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Feedback error={error} />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: palette.primary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px",
            fontWeight: 600,
            fontSize: "1rem",
            marginTop: 6,
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div style={{ marginTop: 10 }}>
          <span style={{ color: "#666" }}>
            No account?{" "}
            <Link to="/signup" style={{ color: palette.primary, fontWeight: 500 }}>
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </CenteredContainer>
  );
}

// PUBLIC_INTERFACE
function SignupScreen() {
  const { signup } = React.useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const res = await signup(email, password);
    if (res.error) setError(res.error);
    else {
      setSuccess("Account created! Please log in.");
      setTimeout(() => navigate("/login"), 900);
    }
  };

  return (
    <CenteredContainer>
      <form onSubmit={handleSubmit} style={{ width: 320, maxWidth: "96%" }}>
        <h2>Sign Up</h2>
        <Field
          label="Email"
          name="email"
          type="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="Confirm Password"
          name="confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Feedback error={error} success={success} />
        <button
          type="submit"
          style={{
            width: "100%",
            background: palette.secondary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px",
            fontWeight: 600,
            fontSize: "1rem",
            marginTop: 6,
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
        <div style={{ marginTop: 10 }}>
          <span style={{ color: "#666" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: palette.secondary, fontWeight: 500 }}>
              Login
            </Link>
          </span>
        </div>
      </form>
    </CenteredContainer>
  );
}

function CenteredContainer({ children }) {
  return (
    <div
      style={{
        minHeight: "83vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 15,
      }}
    >
      {children}
    </div>
  );
}

/* ========== EVENTS VIEWS & FORMS ========== */
// PUBLIC_INTERFACE
function EventListScreen() {
  const { token } = React.useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getEvents(token)
      .then(setEvents)
      .catch((e) => setErr("Failed to load events."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h2>Events</h2>
      {loading && <div>Loading events...</div>}
      <Feedback error={err} />
      <div>
        {events.length === 0 && !loading && <div>No events yet.</div>}
        {events.map((ev) => (
          <div
            key={ev.id}
            style={{
              border: "1.5px solid #e8eaf0",
              borderRadius: 11,
              padding: "1.1rem 1.5rem",
              margin: "1.25rem 0",
              background: "#fff",
              boxShadow: "0 2px 7px rgba(45,156,219,0.07)",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "1.22rem" }}>
              <Link
                to={`/events/${ev.id}`}
                style={{
                  textDecoration: "none",
                  color: palette.primary,
                  marginRight: 12,
                }}
              >
                {ev.title}
              </Link>
            </div>
            <div style={{ color: "#757575", margin: "2px 0 9px 0", fontSize: "0.99rem" }}>
              {ev.date} {ev.time ? `• ${ev.time}` : ""} <span style={{ marginLeft: 6 }}>@ {ev.location}</span>
            </div>
            <div style={{ margin: "7px 0 0 1px", color: "#444" }}>
              {ev.description.length > 90
                ? ev.description.substr(0, 90) + "…"
                : ev.description}
            </div>
            <div style={{ marginTop: 10, color: "#444" }}>
              🧑 Host: {ev.host}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function EventDetailsScreen() {
  const { token } = React.useContext(AuthContext);
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getEvent(id, token)
      .then((ev) => setEvent(ev))
      .catch(() => setErr("Event not found."))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <CenteredContainer>Loading event...</CenteredContainer>;
  if (err) return <CenteredContainer><Feedback error={err} /></CenteredContainer>;
  if (!event)
    return (
      <CenteredContainer>
        <Feedback error="Event does not exist or is inaccessible." />
      </CenteredContainer>
    );
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "2rem 1.3rem",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 7px rgba(86,204,242,0.06)",
        textAlign: "left",
      }}
    >
      <h2 style={{ marginBottom: 7 }}>{event.title}</h2>
      <div style={{ color: "#757575", marginBottom: 9 }}>
        {event.date} {event.time} @ {event.location}
      </div>
      <div style={{ color: "#333", marginBottom: 12, fontSize: "1.05rem" }}>{event.description}</div>
      <div style={{ marginTop: 22 }}>
        <strong>Guest List & RSVP:</strong>
        <ul>
          {event.guests.map((g, idx) => (
            <li key={idx}>
              {g.name} —{" "}
              <span
                style={{
                  color:
                    g.rsvp === "yes"
                      ? palette.accent
                      : g.rsvp === "maybe"
                      ? "#F2C94C"
                      : "#7B7B7B",
                  fontWeight: 500,
                }}
              >
                {g.rsvp.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* RSVP buttons, invite, and guest management would go here */}
    </div>
  );
}

// PUBLIC_INTERFACE
function EventEditScreen({ isNew }) {
  const { token } = React.useContext(AuthContext);
  const { id } = useParams();
  const [event, setEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNew && id) {
      api.getEvent(id, token).then(setEvent).catch(() => {});
    }
  }, [id, isNew, token]);

  const handleChange = (e) => {
    setEvent((ev) => ({ ...ev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!event.title || !event.date || !event.location) {
      setError("Title, date, and location are required.");
      return;
    }
    if (isNew) {
      const res = await api.createEvent(event, token);
      if (res.success) {
        setSuccess("Event created!");
        setTimeout(() => navigate(`/events/${res.id}`), 1000);
      } else setError(res.error || "Failed to create event.");
    } else {
      const res = await api.updateEvent(id, event, token);
      if (res.success) {
        setSuccess("Event updated.");
        setTimeout(() => navigate(`/events/${id}`), 1000);
      } else setError(res.error || "Failed to update event.");
    }
  };

  return (
    <CenteredContainer>
      <form style={{ width: 380, maxWidth: "98%" }} onSubmit={handleSubmit}>
        <h2>{isNew ? "Create" : "Edit"} Event</h2>
        <Field
          label="Title"
          name="title"
          value={event.title}
          onChange={handleChange}
          required
        />
        <Field
          label="Date"
          name="date"
          type="date"
          value={event.date}
          onChange={handleChange}
          required
        />
        <Field
          label="Time"
          name="time"
          type="time"
          value={event.time}
          onChange={handleChange}
        />
        <Field
          label="Location"
          name="location"
          value={event.location}
          onChange={handleChange}
          required
        />
        <div style={{ marginBottom: 18 }}>
          <label>Description</label>
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
            rows={3}
            style={{
              width: "100%",
              border: "1px solid #e1e6ea",
              borderRadius: 6,
              padding: "8px",
              fontSize: "1rem",
              resize: "vertical",
            }}
          />
        </div>
        <Feedback error={error} success={success} />
        <button
          type="submit"
          style={{
            width: "100%",
            background: isNew ? palette.primary : palette.secondary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px",
            fontWeight: 600,
            fontSize: "1rem",
            marginTop: 6,
            cursor: "pointer",
          }}
        >
          {isNew ? "Create Event" : "Update Event"}
        </button>
      </form>
    </CenteredContainer>
  );
}

// Additional planned components: GuestListScreen, InvitationsScreen, RSVP actions...

/* ========== ROUTE GUARDS ========== */
function RequireAuth({ children }) {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Helper for React Router v6 useParams outside components
function useParams() {
  const { pathname } = useLocation();
  const segments = pathname.split("/");
  if (pathname.startsWith("/events/") && segments.length >= 3)
    return { id: segments[2] };
  return {};
}

/* ========== APP ========== */
// PUBLIC_INTERFACE
function App() {
  // THEME (already minimalistic, with palette from above)
  useEffect(() => {
    document.body.style.background = "#f8faff";
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />

          {/* Protected */}
          <Route
            path="/events"
            element={
              <RequireAuth>
                <EventListScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/events/new"
            element={
              <RequireAuth>
                <EventEditScreen isNew />
              </RequireAuth>
            }
          />
          <Route
            path="/events/:id"
            element={
              <RequireAuth>
                <EventDetailsScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <RequireAuth>
                <EventEditScreen />
              </RequireAuth>
            }
          />
          {/* Default: redirect to events if logged in, else login */}
          <Route
            path="/"
            element={
              <AuthContext.Consumer>
                {({ user }) =>
                  user ? <Navigate to="/events" /> : <Navigate to="/login" />
                }
              </AuthContext.Consumer>
            }
          />
          <Route
            path="*"
            element={
              <CenteredContainer>
                <h2>Not found</h2>
                <Link to="/" style={{ color: palette.primary }}>
                  Go Home
                </Link>
              </CenteredContainer>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
