"use client"

import { useState, useEffect, FormEvent } from "react"
import { useAuth } from "@/lib/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save, Camera, Mail, Key, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { profilesApi } from "@/lib/api/profiles"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  
  
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState("")
  
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      
      setFirstName(user.first_name || "")
      setLastName(user.last_name || "")
      setBio(user.bio || "")
      setLocation(user.location || "")
      setPhoneNumber(user.phone_number || "")
      setWebsite(user.website || "")
      setLinkedinUrl(user.linkedin_url || "")
      setGithubUrl(user.github_url || "")
      if (user.profile_picture) {
        setProfilePicturePreview(user.profile_picture)
      }
      setIsLoading(false)
    }
  }, [user, router])

  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  
  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      
      await profilesApi.updateMyProfile({
        first_name: firstName,
        last_name: lastName,
        bio: bio || null,
        location: location || null,
        phone_number: phoneNumber || null,
        website: website || null,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
        profile_picture: profilePicture,
      })
      
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      })
      
      
      window.location.reload()
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess(false)
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    
    try {
      setIsChangingPassword(true)
      await authApi.changePassword(currentPassword, newPassword, confirmPassword)
      
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      toast({
        title: "Success!",
        description: "Your password has been updated successfully.",
      })
    } catch (err) {
      console.error("Failed to change password:", err)
      setPasswordError(err instanceof Error ? err.message : "Failed to change password.")
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to change password.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }
  
  
  const handleResendVerification = async () => {
    try {
      setIsResendingVerification(true)
      await authApi.resendVerificationEmail()
      
      toast({
        title: "Success!",
        description: "Verification email has been sent. Please check your email.",
      })
    } catch (err) {
      console.error("Failed to resend verification email:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to resend verification email.",
        variant: "destructive",
      })
    } finally {
      setIsResendingVerification(false)
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
        </div>
      </AuthGuard>
    )
  }

  if (!user) {
    return null 
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="rounded-full p-2 mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="border-none shadow-sm rounded-xl sticky top-20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profilePicturePreview || ""} alt={user.first_name} />
                      <AvatarFallback className="text-2xl">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">
                      {user.first_name} {user.last_name}
                    </h2>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="mt-2">
                      {user.is_email_verified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                          <AlertCircle className="h-3 w-3 mr-1" /> Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <Button
                    variant="ghost"
                    className={`justify-start px-2 ${activeTab === "profile" ? "bg-gray-100" : ""}`}
                    onClick={() => setActiveTab("profile")}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className={`justify-start px-2 ${activeTab === "password" ? "bg-gray-100" : ""}`}
                    onClick={() => setActiveTab("password")}
                  >
                    Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="profile">
                <Card className="border-none shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your personal information and profile details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="rounded-lg"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="rounded-lg"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="rounded-lg"
                          rows={4}
                          placeholder="Tell us about yourself"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="rounded-lg"
                          placeholder="e.g. New York, NY"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="rounded-lg"
                          placeholder="e.g. +1 (555) 123-4567"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="rounded-lg"
                          placeholder="e.g. https://yourwebsite.com"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                          <Input
                            id="linkedinUrl"
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="rounded-lg"
                            placeholder="e.g. https://linkedin.com/in/yourprofile"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="githubUrl">GitHub URL</Label>
                          <Input
                            id="githubUrl"
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="rounded-lg"
                            placeholder="e.g. https://github.com/yourusername"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="profilePicture">Profile Picture</Label>
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profilePicturePreview || ""} alt={firstName} />
                            <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
                          </Avatar>
                          <Input
                            id="profilePicture"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="rounded-lg"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum file size: 2MB. Recommended dimensions: 300x300px.
                        </p>
                      </div>
                      
                      <Button type="submit" className="w-full bg-[#0071e3] hover:bg-[#0077ED] rounded-lg" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                {!user.is_email_verified && (
                  <Card className="border-none shadow-sm rounded-xl mt-6">
                    <CardHeader>
                      <CardTitle>Email Verification</CardTitle>
                      <CardDescription>
                        Your email is not verified. Please verify your email to access all features.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-800" />
                        <AlertDescription className="text-amber-800">
                          We've sent a verification email to {user.email}. Please check your inbox and follow the instructions.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={handleResendVerification} 
                        className="w-full bg-[#0071e3] hover:bg-[#0077ED] rounded-lg"
                        disabled={isResendingVerification}
                      >
                        {isResendingVerification ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" /> Resend Verification Email
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="password">
                <Card className="border-none shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {passwordError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {passwordSuccess && (
                      <Alert className="mb-4 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-800" />
                        <AlertDescription className="text-green-800">
                          Your password has been updated successfully.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="rounded-lg"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="rounded-lg"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="rounded-lg"
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-[#0071e3] hover:bg-[#0077ED] rounded-lg" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-4 w-4" /> Change Password
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
