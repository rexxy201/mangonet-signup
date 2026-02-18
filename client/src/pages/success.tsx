import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";

export default function Success() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h1>
          <p className="text-gray-500 mb-8">
            Thank you for signing up with MangoNet. We have received your details and a representative will contact you shortly to confirm your installation.
          </p>
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full">Return Home</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="w-full">View Application Status</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
