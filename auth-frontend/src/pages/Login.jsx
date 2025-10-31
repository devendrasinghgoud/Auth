import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/auth";
import {
  Form,
  Button,
  Container,
  Alert,
  Spinner,
} from "react-bootstrap";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/users/login", formData);

      setSuccess(res.data.message || "Login successful!");

      // Save user data and token
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token || "dummy-token");

      // Remember me (optional)
      if (rememberMe) {
        localStorage.setItem("rememberEmail", formData.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // Redirect after success
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg p-4 rounded-4"
        style={{ width: "400px" }}
      >
        <h3 className="text-center text-primary mb-3 fw-bold">Welcome Back </h3>
        <p className="text-center text-muted mb-4">
          Log in to access your account securely
        </p>

        {error && <Alert variant="danger" className="text-center">{error}</Alert>}
        {success && <Alert variant="success" className="text-center">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Email Field */}
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </Form.Group>

          {/* Password Field */}
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </Form.Group>

          {/* Remember Me and Forgot Password */}
          <Form.Group className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check
              type="checkbox"
              label="Remember Me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Link
              to="/forgot-password"
              className="text-primary small text-decoration-none"
            >
              Forgot Password?
            </Link>
          </Form.Group>

          {/* Submit Button */}
          <div className="d-grid">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="rounded-pill fw-semibold"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </Form>

        {/* Sign up link */}
        <p className="mt-3 text-center text-muted">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="fw-semibold text-decoration-none text-primary"
          >
            Sign up
          </Link>
        </p>
      </div>
    </Container>
  );
}
