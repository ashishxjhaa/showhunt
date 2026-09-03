import AppShell from "@/components/AppShell"
import Page from "@/components/Page"

// Auth is enforced client-side in Page (useMe). Do not check cookies here —
// the API auth cookie lives on the API host, not the Vercel frontend domain.
const Profile = () => {
  return (
    <AppShell>
      <Page />
    </AppShell>
  )
}

export default Profile
