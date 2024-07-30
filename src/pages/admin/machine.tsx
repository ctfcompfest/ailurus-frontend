import { AdminContextProvider } from "@/components/module/admin/AdminContext";
import AdminLayout from "@/components/module/admin/AdminLayout";
import MachinePage from "@/components/module/admin/machine/MachinePage";
import React, { ReactElement } from "react";

export default function Machine() {
  return (
    <AdminLayout>
      <MachinePage />
    </AdminLayout>
  );
}

Machine.getLayout = function getLayout(page: ReactElement) {
  return <AdminContextProvider>{page}</AdminContextProvider>;
};
