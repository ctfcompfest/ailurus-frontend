import DashboardLayout from "@/components/module/dashboard/DashboardLayout";
import ServicePage from "@/components/module/dashboard/service/ServicePage";
import React, { ReactElement } from "react";

export default function service() {
  return <ServicePage />;
}

service.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
