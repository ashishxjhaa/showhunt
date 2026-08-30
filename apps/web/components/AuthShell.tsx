import StickyPaperNavbar from "@/components/landing/StickyPaperNavbar"

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StickyPaperNavbar />
      <div className="paper-page light min-h-screen w-full">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex min-h-screen items-start justify-center px-4 pt-20 pb-8 sm:items-center sm:px-5 sm:pt-24 sm:pb-12">
            <div className="mx-auto w-full max-w-md shrink-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
