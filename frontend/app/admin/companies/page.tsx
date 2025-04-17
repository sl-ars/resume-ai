"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building } from "lucide-react"
import Link from "next/link"
import RoleGuard from "@/components/role-guard"

export default function AdminCompaniesPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="rounded-full p-2 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Manage Companies</h1>
        </div>

        <Card className="border-none shadow-sm rounded-xl mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" /> Company Management
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Building className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Coming Soon</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                The company management feature is currently under development. 
                Check back soon for updates.
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg max-w-md">
                <p className="font-medium mb-2">Future Features:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Add and manage company profiles</li>
                  <li>View company job listings</li>
                  <li>Manage company recruiters</li>
                  <li>View company analytics</li>
                  <li>Verify company information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
} 