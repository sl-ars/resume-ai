// src/pages/MainPage.tsx
import { Navbar } from "@/components/Navbar";

export default function MainPage() {
  return (
    <div>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <h1 className="text-4xl font-bold mb-6 text-center">Welcome to ResumeAI</h1>
        <p className="text-gray-600 text-lg max-w-2xl text-center">
          Your personal AI-powered resume analyzer. Upload your resume, get instant feedback, and improve your chances of landing your dream job.
        </p>
      </main>
    </div>
  );
}