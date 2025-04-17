"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Download, 
  Mail, 
  Briefcase, 
  User, 
  Loader2,
  FileText,
  AlertTriangle,
  Percent,
  BarChart
} from "lucide-react"
import RoleGuard from "@/components/role-guard"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { applicationsApi, type Application } from "@/lib/api/applications"
import { jobsApi } from "@/lib/api/jobs"
import { usePagination } from "@/lib/hooks/use-pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

export default function ApplicantsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [openNoteDialog, setOpenNoteDialog] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [note, setNote] = useState("")
  const [submittingNote, setSubmittingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [matchingResumeId, setMatchingResumeId] = useState<string | null>(null)
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [isMatching, setIsMatching] = useState(false)


  const isMounted = useRef(true)

  const isFirstRender = useRef(true)

  const searchQueryRef = useRef(searchQuery)
  const statusFilterRef = useRef(statusFilter)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  

  const latestRequestIdRef = useRef(0);
  

  useEffect(() => {
    searchQueryRef.current = searchQuery;
    statusFilterRef.current = statusFilter;
  }, [searchQuery, statusFilter]);


  useEffect(() => {
    return () => {
      isMounted.current = false;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);


  const fetchApplications = useCallback(
    async (page: number, pageSize: number) => {

      const thisRequestId = ++latestRequestIdRef.current;
      
      try {

        const params: Record<string, string> = {}
        

        if (statusFilterRef.current !== "all") {
          params.status = statusFilterRef.current
        }
        

        if (searchQueryRef.current) {
          params.search = searchQueryRef.current
        }
        
        const response = await applicationsApi.getAllApplications(page, pageSize, params);
        

        if (thisRequestId !== latestRequestIdRef.current) {
          console.log('Discarding stale request result');
          return { results: [], pagination: { count: 0, next: null, previous: null } };
        }
        
        return response;
      } catch (err) {
        console.error("Error fetching applications:", err)
        return { results: [], pagination: { count: 0, next: null, previous: null } }
      }
    },
    []
  )


  const {
    data: applications,
    isLoading,
    error,
    page,
    totalPages,
    nextPage,
    prevPage,
    refresh,
  } = usePagination<Application>({
    fetchFunction: fetchApplications,
    initialPage: 1,
    initialPageSize: 10,
    autoFetch: false
  })


  useEffect(() => {

    if (isMounted.current) {
      refresh();
    }
    
    return () => {

    };
  }, []);


  const debouncedRefresh = useCallback(() => {

    const currentRefresh = refresh;
    

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    

    debounceTimerRef.current = setTimeout(() => {
      if (isMounted.current) {
        currentRefresh();
      }
    }, 300);
  }, []);
  

  useEffect(() => {

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    debouncedRefresh();
    

  }, [searchQuery, statusFilter, debouncedRefresh]);


  useEffect(() => {
    if (error && isMounted.current) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch applications",
        variant: "destructive",
      });
    }
  }, [error, toast]);


  const handleStatusUpdate = async (applicationId: string, newStatus: "pending" | "reviewed" | "approved" | "rejected") => {
    if (!isMounted.current) return;
    
    try {
      setUpdatingStatus(applicationId);
      
      let updatedApplication: Application;


      switch (newStatus) {
        case "reviewed":
          updatedApplication = await applicationsApi.markAsReviewed(applicationId);
          break;
        case "approved":
          updatedApplication = await applicationsApi.approveApplication(applicationId);
          break;
        case "rejected":
          updatedApplication = await applicationsApi.rejectApplication(applicationId);
          break;
        default:
          updatedApplication = await applicationsApi.updateApplicationStatus(applicationId, { status: newStatus });
      }
      
      if (isMounted.current) {
        toast({
          title: "Success",
          description: `Application status updated to ${newStatus}`
        });
        

        debouncedRefresh();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      
      if (isMounted.current) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to update application status",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setUpdatingStatus(null);
      }
    }
  }

  // Handle adding a note
  const handleAddNote = async () => {
    if (!selectedApplication || !note.trim() || !isMounted.current) return;
    
    try {
      setSubmittingNote(true);
      
      // Add the note to the application
      await applicationsApi.addNotes(selectedApplication.id, note);
      
      if (isMounted.current) {
        toast({
          title: "Success",
          description: "Note added successfully"
        });
        
        // Close the dialog and refresh the list
        setOpenNoteDialog(false);
        setNote("");
        debouncedRefresh();
      }
    } catch (err) {
      console.error("Failed to add note:", err);
      
      if (isMounted.current) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to add note",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setSubmittingNote(false);
      }
    }
  }

  // Open note dialog with the selected application
  const openNoteDialogForApplication = (application: Application) => {
    if (!isMounted.current) return;
    setSelectedApplication(application);
    setNote(application.notes || "");
    setOpenNoteDialog(true);
  }

  // Get resume download URL
  const getResumeDownloadUrl = (resumeId: string) => {
    if (!resumeId) return '#'; // Return a safe value if resumeId is missing
    return applicationsApi.getResumeDownloadUrl(resumeId);
  }

  // Get status badge based on status
  const getStatusBadge = (status: Application['status']) => {
    switch(status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "reviewed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Reviewed</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  }

  // Helper functions to handle the updated Application type
  const getApplicantName = (application: Application): string => {
    if (!application) return '';
    
    if (application.applicant && application.applicant.name) {
      return application.applicant.name;
    }
    // If no applicant object, use the email (which should always be present)
    if (!application.applicant_email) return 'Unknown';
    
    const emailPrefix = application.applicant_email.split('@')[0];
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }

  const getApplicantEmail = (application: Application): string => {
    if (!application) return '';
    
    if (application.applicant && application.applicant.email) {
      return application.applicant.email;
    }
    return application.applicant_email || '';
  }

  const getApplicantInitials = (application: Application): string => {
    if (!application) return '';
    
    if (application.applicant && application.applicant.name) {
      return application.applicant.name.charAt(0).toUpperCase();
    }
    // If no name, use first letter of email
    if (!application.applicant_email) return '?';
    
    return application.applicant_email.charAt(0).toUpperCase();
  }

  const getApplicationStatus = (application: Application): "pending" | "reviewed" | "approved" | "rejected" => {
    if (!application) return "pending";
    
    // If the application has a status field, use it
    if (application.status && 
        (application.status === "pending" || 
         application.status === "reviewed" || 
         application.status === "approved" || 
         application.status === "rejected")) {
      return application.status;
    }
    
    // Otherwise infer from is_approved and job status
    if (application.is_approved) {
      return "approved";
    }
    
    if (application.job && application.job.status === "rejected") {
      return "rejected";
    }
    
    return "pending";
  }

  // Get avatar image source
  const getAvatarSrc = (application: Application): string | undefined => {
    if (!application) return undefined;
    
    if (application.applicant && application.applicant.profile_picture) {
      return application.applicant.profile_picture;
    }
    return undefined;
  }

  // Handle resume matching
  const handleMatchResume = async (jobId: string, resumeId: string) => {
    if (!isMounted.current) return;
    
    try {
      setMatchingResumeId(resumeId);
      setIsMatching(true);
      
      const result = await jobsApi.matchResumeToJob(jobId, resumeId);
      
      if (isMounted.current) {
        setMatchScore(result.score);
        const scorePercentage = typeof result.score === 'number' ? Math.round(result.score * 100) : 0;
        toast({
          title: "Match Score",
          description: `Resume match score: ${scorePercentage}%`
        });
      }
    } catch (err) {
      console.error("Failed to match resume:", err);
      
      if (isMounted.current) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to match resume to job",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsMatching(false);
        // Clear match score after 5 seconds
        setTimeout(() => {
          if (isMounted.current) {
            setMatchScore(null);
            setMatchingResumeId(null);
          }
        }, 5000);
      }
    }
  }

  return (
    <RoleGuard allowedRoles={["recruiter", "admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Users className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-bold">Applicants Management</h1>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applicants or jobs..."
              className="pl-10 w-full sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => {
                if (!isMounted.current) return;
                setSearchQuery(e.target.value);
              }}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => {
            if (!isMounted.current) return;
            setStatusFilter(value);
          }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load applications. Please try again."}
            </AlertDescription>
          </Alert>
        ) : applications.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No applicants found</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                {searchQuery || statusFilter !== "all"
                  ? "No applications match your search criteria. Try different search terms or filters."
                  : "You haven't received any job applications yet."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (!isMounted.current) return;
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="border-none shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={getAvatarSrc(application)} />
                          <AvatarFallback>{getApplicantInitials(application)}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="font-medium">{getApplicantName(application)}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            <span>{getApplicantEmail(application)}</span>
                          </div>
                          {application.resume && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FileText className="h-3 w-3 mr-1" />
                              <span>Resume: {application.resume.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm">
                          <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{application.job.title}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-auto">
                        {getStatusBadge(getApplicationStatus(application))}
                      </div>
                    </div>
                    
                    {application.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                        <p className="font-semibold mb-1">Notes:</p>
                        <p>{application.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-6 justify-end">
                      <Link 
                        href={`/resume/${application.resume?.id || application.resume_id}/content`}
                      >
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <FileText className="mr-1 h-4 w-4" /> View Content
                        </Button>
                      </Link>
                      
                      <Link 
                        href={`/resume/${application.resume?.id || application.resume_id}/analysis`}
                      >
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <BarChart className="mr-1 h-4 w-4" /> View Analysis
                        </Button>
                      </Link>
                      
                      <a 
                        href={getResumeDownloadUrl(application.resume?.id || application.resume_id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="rounded-lg">
                          <Download className="mr-1 h-4 w-4" /> Download
                        </Button>
                      </a>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg"
                        onClick={() => handleMatchResume(application.job.id, application.resume?.id || application.resume_id)}
                        disabled={isMatching && matchingResumeId === (application.resume?.id || application.resume_id)}
                      >
                        {isMatching && matchingResumeId === (application.resume?.id || application.resume_id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <><Percent className="mr-1 h-4 w-4" /> Match Score</>
                        )}
                      </Button>
                      
                      {matchScore !== null && matchingResumeId === (application.resume?.id || application.resume_id) && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          Match: {typeof matchScore === 'number' ? Math.round(matchScore * 100) : 0}%
                        </Badge>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg"
                        onClick={() => openNoteDialogForApplication(application)}
                      >
                        <FileText className="mr-1 h-4 w-4" /> Add Note
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg"
                        onClick={() => handleStatusUpdate(application.id, "reviewed")}
                        disabled={getApplicationStatus(application) === "reviewed" || updatingStatus === application.id}
                      >
                        {updatingStatus === application.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <User className="mr-1 h-4 w-4" />
                        )}
                        Mark Reviewed
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg bg-green-50 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-900"
                        onClick={() => handleStatusUpdate(application.id, "approved")}
                        disabled={getApplicationStatus(application) === "approved" || updatingStatus === application.id}
                      >
                        {updatingStatus === application.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="mr-1 h-4 w-4" />
                        )}
                        Approve
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg bg-red-50 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-900"
                        onClick={() => handleStatusUpdate(application.id, "rejected")}
                        disabled={getApplicationStatus(application) === "rejected" || updatingStatus === application.id}
                      >
                        {updatingStatus === application.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <XCircle className="mr-1 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={prevPage} 
                  disabled={page === 1 || isLoading} 
                  className="rounded-lg"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  onClick={nextPage} 
                  disabled={page === totalPages || isLoading} 
                  className="rounded-lg"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Note Dialog */}
        <Dialog open={openNoteDialog} onOpenChange={setOpenNoteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>
                Add a note about this application. This will only be visible to recruiters.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  rows={5}
                  placeholder="Enter your notes about this applicant..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setOpenNoteDialog(false)}
                disabled={submittingNote}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddNote}
                disabled={!note.trim() || submittingNote}
              >
                {submittingNote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Note'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  )
} 