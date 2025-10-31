import React, { useState } from "react";
import { Form, Button, Alert, Container, Spinner } from "react-bootstrap";
import api from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function VerifyResetOtp() {
  const [formData, setFormData] = useState({ email: "", otp: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/api/users/verify-reset-otp", formData);
      setMessage(res.data.message);
      setTimeout(() => navigate("/reset-password", { state: { email: formData.email } }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow rounded-4" style={{ width: "400px" }}>
        <h4 className="text-center text-primary mb-3 fw-bold">Verify OTP</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>OTP</Form.Label>
            <Form.Control
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Verify OTP"}
          </Button>
        </Form>
      </div>
    </Container>
  );
}
