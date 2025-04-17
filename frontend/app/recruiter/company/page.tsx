"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Building, 
  Globe, 
  Save, 
  Upload, 
  Loader2,
  AlertTriangle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import RoleGuard from "@/components/role-guard"
import { useToast } from "@/components/ui/use-toast"
import { companiesApi, type Company as CompanyType } from "@/lib/api/companies"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CompanyPage() {
  const { toast } = useToast()
  const [company, setCompany] = useState<CompanyType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [website, setWebsite] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState("")


  useEffect(() => {
    async function fetchCompanyData() {
      try {
        setLoading(true)
        setError(null)
        

        const companyData = await companiesApi.getCurrentUserCompany()
        setCompany(companyData)
        

        setName(companyData.name)
        setDescription(companyData.description || "")
        setWebsite(companyData.website || "")
        if (companyData.logo) {
          setLogoPreview(companyData.logo)
        }
      } catch (err) {
        console.error("Failed to fetch company data:", err)
        setError("Failed to load company information. You may need to create a company first.")

        setName("")
        setDescription("")
        setWebsite("")
        setLogoPreview("")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      const companyData = {
        name,
        description: description || undefined,
        website: website || undefined,
        logo: logo
      }
      
      let updatedCompany: CompanyType
      
      if (company?.id) {

        updatedCompany = await companiesApi.updateCompany(company.id, companyData)
        toast({
          title: "Success",
          description: "Company information updated successfully",
        })
      } else {

        updatedCompany = await companiesApi.createCompany(companyData as any)
        toast({
          title: "Success",
          description: "Company created successfully",
        })
      }
      

      setCompany(updatedCompany)
      

      setLogo(null)
    } catch (err) {
      console.error("Failed to save company:", err)
      setError(err instanceof Error ? err.message : "Failed to update company information")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update company information",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <RoleGuard allowedRoles={["recruiter", "admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Building className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-bold">Company Management</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>{company ? "Company Information" : "Create Company"}</CardTitle>
                  <CardDescription>
                    {company 
                      ? "Update your company details visible to job seekers" 
                      : "Create your company profile to start posting jobs"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Company Description</Label>
                      <Textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Describe your company"
                        rows={5}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)} 
                        placeholder="https://example.com"
                        type="url"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-[#0071e3] hover:bg-[#0077ED] rounded-lg"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> {company ? "Save Changes" : "Create Company"}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border-none shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle>Company Logo</CardTitle>
                  <CardDescription>Upload your company logo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-32 w-32 border rounded-md flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Company logo" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building className="h-12 w-12 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="w-full">
                      <Label htmlFor="logo" className="block mb-2">Upload New Logo</Label>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended size: 300x300 pixels. Max 2MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {website && (
                <Card className="border-none shadow-sm rounded-xl mt-6">
                  <CardHeader>
                    <CardTitle>Company Website</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-400 mr-2" />
                      <a 
                        href={website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#0071e3] hover:underline truncate"
                      >
                        {website}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {company && (
                <Card className="border-none shadow-sm rounded-xl mt-6">
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500 block">Created:</span>
                        <span>{new Date(company.created_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Recruiters:</span>
                        <span>{company.recruiters?.length || 1}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
} 