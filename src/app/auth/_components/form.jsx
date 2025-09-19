// src/app/auth/components/Form.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";
import Image from "next/image";

export default function Form() {
  const router = useRouter();
  const [form, setForm] = useState({
    loginId: "", // Pastikan nilai awal adalah string kosong
    password: "", // Pastikan nilai awal adalah string kosong
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/auth/login", form);

      Swal.fire({
        icon: "success",
        title: "Sukses",
        text: "Login berhasil!",
        showConfirmButton: false,
        timer: 1500,
      });

      router.refresh();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data.message || "Login gagal. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "auto",
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{ textAlign: "center", marginBottom: "1.5rem", color: "#333" }}
        className="font-bold"
      >
        <Link className="inline-block" href="/">
          <Image
            className="mb-0"
            src={"/images/icons/logo.png"}
            alt="Logo"
            width={170}
            height={22}
          />
        </Link>
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="loginId"
            style={{
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Email atau Username
          </label>
          <input
            id="loginId"
            type="text"
            value={form.loginId ?? ""} // Tambahkan nullish coalescing operator
            onChange={(e) => setForm({ ...form, loginId: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password ?? ""}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.75rem",
            // backgroundColor: isLoading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
          className="bg-company-500 hover:bg-company-700"
        >
          {isLoading ? "Memproses..." : "Login"}
        </button>
      </form>
    </div>
  );
}
