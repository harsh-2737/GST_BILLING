import { useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { loginUser, registerUser } from "../../api/authApi.js";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    gstin: "",
    address: "",
    email: "",
    phone_no: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegistering = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = isRegistering
        ? await registerUser(form)
        : await loginUser(form);
      onAuthenticated(result);
    } catch (requestError) {
      setError(requestError.message || "Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <a className="brand auth-brand" href="#login" aria-label="VYAPAR home">
          <span className="brand-mark">V</span>
          <span>VYAPAR<span className="brand-period">.</span></span>
        </a>
        <div className="auth-story-copy">
          <p className="eyebrow">A CLEARER WAY TO DO BUSINESS</p>
          <h1>Every bill.<br />Under control<span>.</span></h1>
          <p>GST billing and payments, together in one place.</p>
        </div>
        <div className="auth-story-foot">Simple books. Better business.</div>
      </section>

      <section className="auth-main">
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <span className="auth-icon"><LockKeyhole size={18} /></span>
            <p className="eyebrow">YOUR VYAPAR WORKSPACE</p>
            <h2>{isRegistering ? "Create your account" : "Welcome back"}</h2>
            <p>{isRegistering ? "Set up your business account to get started." : "Sign in to continue to your business."}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <label className="auth-field">
                  <span>Business name</span>
                  <span className="auth-input-wrap">
                    <Building2 size={16} />
                    <input
                      name="businessName"
                      value={form.businessName}
                      onChange={updateField}
                      autoComplete="organization"
                      minLength="2"
                      maxLength="150"
                      required
                      placeholder="Registered business name"
                    />
                  </span>
                </label>
                <label className="auth-field">
                  <span>GSTIN</span>
                  <span className="auth-input-wrap">
                    <BadgeCheck size={16} />
                    <input
                      name="gstin"
                      value={form.gstin}
                      onChange={updateField}
                      autoCapitalize="characters"
                      minLength="15"
                      maxLength="15"
                      pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]"
                      required
                      placeholder="15-character GSTIN"
                    />
                  </span>
                </label>
                <label className="auth-field">
                  <span>Business address</span>
                  <span className="auth-input-wrap">
                    <MapPin size={16} />
                    <input
                      name="address"
                      value={form.address}
                      onChange={updateField}
                      autoComplete="street-address"
                      minLength="5"
                      maxLength="300"
                      required
                      placeholder="Registered business address"
                    />
                  </span>
                </label>
                <label className="auth-field">
                  <span>Owner name</span>
                  <span className="auth-input-wrap">
                    <UserRound size={16} />
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      autoComplete="name"
                      minLength="2"
                      maxLength="100"
                      required
                      placeholder="Full name"
                    />
                  </span>
                </label>
                <label className="auth-field">
                  <span>Mobile number</span>
                  <span className="auth-input-wrap">
                    <Phone size={16} />
                    <input
                      name="phone_no"
                      type="tel"
                      value={form.phone_no}
                      onChange={updateField}
                      autoComplete="tel"
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      maxLength="10"
                      required
                      placeholder="10-digit mobile number"
                    />
                  </span>
                </label>
              </>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <span className="auth-input-wrap">
                <Mail size={16} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                />
              </span>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <span className="auth-input-wrap">
                <LockKeyhole size={16} />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateField}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  minLength="6"
                  maxLength="100"
                  required
                  placeholder={isRegistering ? "At least 6 characters" : "Enter your password"}
                />
              </span>
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : isRegistering ? "Create account" : "Sign in"}
              <ArrowUpRight size={16} />
            </button>
          </form>

          <p className="auth-switch">
            {isRegistering ? "Already have an account?" : "New to VYAPAR?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isRegistering ? "login" : "register");
                setError("");
              }}
            >
              {isRegistering ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
        <footer className="auth-footer">Protected access for your business account</footer>
      </section>
    </main>
  );
}
