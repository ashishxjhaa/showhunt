import AppNavbar from "@/components/AppNavbar"

interface AppShellProps {
  children: React.ReactNode
  search?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
  showNavbar?: boolean
}

export default function AppShell({
  children,
  search,
  onSearchChange,
  showSearch = false,
  showNavbar = true,
}: AppShellProps) {
  return (
    <>
      {showNavbar && (
        <AppNavbar
          search={search}
          onSearchChange={onSearchChange}
          showSearch={showSearch}
        />
      )}
      <div className="paper-page light min-h-screen w-full">
        <main
          className={
            showNavbar
              ? "mx-auto w-full max-w-6xl pt-[4.75rem] sm:pt-[5.5rem]"
              : "mx-auto w-full max-w-6xl"
          }
        >
          {children}
        </main>
      </div>
    </>
  )
}
