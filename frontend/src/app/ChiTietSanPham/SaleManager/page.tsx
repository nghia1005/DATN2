"use client";
import React from "react";
import SaleManager from '../SaleManager';
import AdminLayout from "../../../component/Admin-Layout";

export default function SaleManagerPage() {
  return (
    <AdminLayout activeMenu="products" onMenuChangeAction={() => {}} pageTitle="Quản lý Sale">
      <SaleManager />
    </AdminLayout>
  );
} 