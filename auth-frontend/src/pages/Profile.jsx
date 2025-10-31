import React from "react";

export default function Profile() {
  const token = localStorage.getItem("token");

  return (
    <div className="text-center">
      <h2 className="mb-4">Profile</h2>
      {token ? (
        <p>Your token: <code>{token}</code></p>
      ) : (
        <p>No token found. Please log in.</p>
      )}
    </div>
  );
}
