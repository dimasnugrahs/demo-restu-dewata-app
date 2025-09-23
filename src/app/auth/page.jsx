import Image from "next/image";
import Link from "next/link";
import Form from "@/app/auth/_components/form";

export const metadata = {
  title: "Restu Dewata App",
  description: "This is internal App for an employee of PT BPR Restu Dewata",
  icons: "/images/icons/logo-tab.png",
};

export default async function loginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-sm border border-stroke bg-white shadow-default">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="px-2 py-1 text-center">
              <p className="2xl:px-20 font-inter-black text-2xl">
                Welcome to Restu Dewata App
              </p>

              <span className="mt-5 inline-block pointer-events-none resize-none">
                <Image
                  className="mb-0"
                  src={"/images/icons/auth-image.jpg"}
                  alt="Logo"
                  width={300}
                  height={100}
                />
              </span>
            </div>
          </div>

          <div className="w-full border-stroke xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-14 xl:p-16">
              <Form />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
