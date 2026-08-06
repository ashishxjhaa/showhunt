'use client'

import { useState } from "react"
import AppShell from "@/components/AppShell"
import ListingsPage from "@/components/ListingsPage"
import { useMe } from "@/lib/queries/hooks"

const Listings = () => {
  const [search, setSearch] = useState("")
  const { data: user, isFetched } = useMe()

  return (
    <AppShell search={search} onSearchChange={setSearch} showSearch>
      <ListingsPage searchQuery={search} isAuthenticated={isFetched && !!user} />
    </AppShell>
  )
}

export default Listings
