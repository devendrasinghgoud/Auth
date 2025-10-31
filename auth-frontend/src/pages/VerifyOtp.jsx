import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/auth"; // your axios instance with baseURL
import { Form, Button, Container, Alert, Spinner } from "react-bootstrap";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";

  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail);
  }, [prefilledEmail]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email || !otp) {
      setError("Both email and OTP are required");
      return;
    }

    setLoadingVerify(true);
    try {
      const res = await api.post("/api/users/verify-otp", { email, otp });
      setMessage(res.data.message || "Verified successfully");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // safe extraction of error message
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Verification failed. Try again.";
      setError(msg);
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    setMessage("");
    setError("");
    if (!email) {
      setError("Please enter your email to resend OTP");
      return;
    }

    setLoadingResend(true);
    try {
      const res = await api.post("/api/users/resend-otp", { email });
      setMessage(res.data.message || "New OTP sent");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP. Try again.";
      setError(msg);
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "480px" }}>
      <div className="card shadow p-4">
        <h3 className="text-center mb-3">Verify OTP</h3>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleVerify}>
          <Form.Group className="mb-3" controlId="verifyEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="registered@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="verifyOtp">
            <Form.Label>OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mb-2"
            disabled={loadingVerify}
          >
            {loadingVerify ? (
              <>
                <Spinner animation="border" size="sm" /> Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={handleResend}
            disabled={loadingResend}
          >
            {loadingResend ? (
              <>
                <Spinner animation="border" size="sm" /> Sending...
              </>
            ) : (
              "Resend OTP"
            )}
          </Button>
        </Form>

        <div className="mt-3 text-center">
          <small>
            Need to change details? <Link to="/signup">Sign up again</Link>
          </small>
        </div>
      </div>
    </Container>
  );
}
