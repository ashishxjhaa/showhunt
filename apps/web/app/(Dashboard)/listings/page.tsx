'use client'

import { useState } from "react"
import AppShell from "@/components/AppShell"
import ListingsPage from "@/components/ListingsPage"
import UploadProject from "@/components/UploadProject"
import { useMe } from "@/lib/queries/hooks"

const Listings = () => {
  const [search, setSearch] = useState("")
  const { data: user, isFetched } = useMe()

  return (
    <AppShell search={search} onSearchChange={setSearch} showSearch>
      <ListingsPage
        searchQuery={search}
        isAuthenticated={isFetched && !!user}
        onSearchChange={setSearch}
      />
      {isFetched && user ? <UploadProject trigger={null} /> : null}
    </AppShell>
  )
}

export default Listings
