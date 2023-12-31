import { AdminContextProvider } from "@/components/module/admin/AdminContext";
import AdminLayout from "@/components/module/admin/AdminLayout";
import React, { ReactElement } from "react";

export default function Admin() {
  return (
    <AdminLayout className="flex justify-center items-center min-h-screen w-full">
      <strong className="font-strong text-xl">
        Please select category on the left side.
      </strong>
    </AdminLayout>
  );
}

Admin.getLayout = function getLayout(page: ReactElement) {
  return <AdminContextProvider>{page}</AdminContextProvider>;
};
