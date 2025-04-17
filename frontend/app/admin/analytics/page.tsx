"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsApi } from "@/lib/api/analytics"
import { Loader2, Search, RefreshCw, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AuthGuard from "@/components/auth-guard"
import { useToast } from "@/components/ui/use-toast"
import { usePagination } from "@/lib/hooks/use-pagination"

type LogEntry = {
  id: string
  timestamp: string
  level: "info" | "warning" | "error"
  message: string
  user_id?: string
  user_email?: string
  endpoint?: string
  method?: string
  status_code?: number
}

export default function AdminAnalyticsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const { toast } = useToast()

  const {
    data: logs,
    isLoading,
    error,
    page,
    totalPages,
    nextPage,
    prevPage,
    refresh,
  } = usePagination<LogEntry>({
    fetchFunction: (page, limit) =>
      analyticsApi.getLogs({ page, limit, level: levelFilter !== "all" ? levelFilter : undefined }),
    additionalParams: { level: levelFilter },
  })

  const handleRefresh = () => {
    refresh()
  }

  const handleDownload = () => {

    const headers = ["Timestamp", "Level", "Message", "User", "Endpoint", "Method", "Status"]

    const csvContent = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.timestamp,
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
          log.user_email || "N/A",
          log.endpoint || "N/A",
          log.method || "N/A",
          log.status_code || "N/A",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `system-logs-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.endpoint && log.endpoint.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <AuthGuard adminOnly>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">System Logs</h1>

        <Card className="border-none shadow-sm rounded-xl mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Activity Logs</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[120px] rounded-lg">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="rounded-lg" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="rounded-lg" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>Error loading logs: {error.message}</p>
                <Button onClick={handleRefresh} className="mt-4 bg-[#0071e3] hover:bg-[#0077ED] rounded-lg">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="w-1/3">Message</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadgeClass(log.level)}`}>
                              {log.level}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                          <TableCell>{log.user_email || "—"}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.endpoint || "—"}</TableCell>
                          <TableCell>{log.method || "—"}</TableCell>
                          <TableCell>{log.status_code || "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button variant="outline" onClick={prevPage} disabled={page === 1} className="rounded-lg">
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <Button variant="outline" onClick={nextPage} disabled={page === totalPages} className="rounded-lg">
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
