'use client'

import { useState } from "react"
import ListingNavbar from "@/components/ListingNavbar"
import ListingsPage from "@/components/ListingsPage"
import { useMe } from "@/lib/queries/hooks"

const Listings = () => {
  const [search, setSearch] = useState("")
  const { data: user, isFetched } = useMe()

  return (
    <div className="bg-[#F6F6EF] dark:bg-neutral-800 min-h-screen w-full overflow-x-hidden">
      <ListingNavbar search={search} onSearchChange={setSearch} />
      <ListingsPage searchQuery={search} isAuthenticated={isFetched && !!user} />
    </div>
  )
}

export default Listings
