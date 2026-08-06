import AppNavbar from "@/components/AppNavbar"

interface AppShellProps {
  children: React.ReactNode
  search?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

export default function AppShell({
  children,
  search,
  onSearchChange,
  showSearch = false,
}: AppShellProps) {
  return (
    <>
      <AppNavbar
        search={search}
        onSearchChange={onSearchChange}
        showSearch={showSearch}
      />
      <div className="paper-frame-rail-left" aria-hidden="true" />
      <div className="paper-frame-rail-right" aria-hidden="true" />
      <div className="paper-page light min-h-screen w-full">
        <main className="mx-auto w-full max-w-6xl border-x border-[var(--app-rail-color)] pt-16 sm:pt-[4.5rem]">
          {children}
        </main>
      </div>
    </>
  )
}
