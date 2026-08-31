import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AppShell from "@/components/AppShell"
import Page from "@/components/Page"

const Profile = async () => {
  // Auth cookie name matches the server (COOKIE_NAME = "token")
  const cookieStore = await cookies()
  if (!cookieStore.has("token")) {
    redirect("/signin")
  }

  return (
    <AppShell>
      <Page />
    </AppShell>
  )
}

export default Profile
