import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Button, Container } from "react-bootstrap";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
    >
      <Card className="shadow-lg p-4 rounded-4 text-center" style={{ maxWidth: "450px", width: "100%" }}>
        <h2 className="text-primary fw-bold mb-3"> Welcome Home</h2>

        {user ? (
          <>
            <div className="mb-3">
              <h4 className="fw-semibold text-dark">Hello, {user.name} </h4>
              <p className="text-muted mb-0">{user.email}</p>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button variant="outline-primary" as={Link} to="/profile">
                View Profile
              </Button>
              <Button variant="outline-danger" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted mt-3">
              You’re not logged in. Please log in to access your account.
            </p>
            <Button variant="outline-primary" as={Link} to="/login">
              Go to Login
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
}
