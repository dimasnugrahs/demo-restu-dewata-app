import DashboardLayout from "../components/DashboardLayout";

export default function SettingPage() {
  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-4 text-white">
        Selamat Datang di Setting
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        Ini adalah halaman setting utama.
      </p>
    </DashboardLayout>
  );
}
