import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12">
        <div>
          <Link href="/" className="text-white text-2xl font-bold tracking-tight">
            TravelBackend<span className="text-teal">.com</span>
          </Link>
          <p className="mt-2 text-blue-200 text-sm">AI-powered operations for travel businesses</p>
        </div>
        <div className="space-y-6">
          <blockquote className="text-white text-lg leading-relaxed">
            &ldquo;TravelBackend handles everything from client proposals to tour publishing — in minutes, not hours.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal/30 flex items-center justify-center text-white font-semibold">
              SL
            </div>
            <div>
              <p className="text-white font-medium text-sm">Sarah L.</p>
              <p className="text-blue-300 text-sm">Owner, Coastal Travel Co.</p>
            </div>
          </div>
        </div>
        <p className="text-blue-400 text-xs">© 2024 TravelBackend.com · All rights reserved</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-2 lg:hidden">
            <Link href="/" className="text-navy text-xl font-bold">
              TravelBackend<span className="text-teal">.com</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-navy mb-1">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
