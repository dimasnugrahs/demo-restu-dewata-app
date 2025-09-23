"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";

export default function BerandaPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user");

        if (response.ok) {
          // Menggunakan response.ok untuk memeriksa status 200
          const data = await response.json();
          setUser(data.user);
        } else {
          // Redirect jika tidak terautentikasi atau terjadi kesalahan
          router.push("/auth");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (!user) {
    // Tampilkan pesan error atau redirect jika user tidak ada
    return <div></div>;
  }

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-4 text-company-950">
        Selamat Datang di Beranda
      </h1>
      <h1 className="text-lg text-company-950">
        Selamat datang, {user.full_name}!
      </h1>

      <div className="p-4 bg-company-100 w-full rounded-md mt-5">
        <div className="grid grid-cols-3 gap-5 ">
          <div className="p-4 bg-company-300 rounded text-sm text-company-950">
            Total Balance
            <div className="text-company-950 text-2xl">332.000</div>
          </div>
          <div className="p-4 bg-company-300 rounded text-sm text-company-950">
            Customers
            <div className="text-company-950 text-2xl">32</div>
          </div>
          <div className="p-4 bg-company-300 rounded text-sm text-company-950">
            Users
            <div className="text-company-950 text-2xl">47</div>
          </div>
        </div>
        <div className="grid grid-cols-1">
          <div className="p-10 text-center bg-red-400 mt-5 rounded">Hello</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
