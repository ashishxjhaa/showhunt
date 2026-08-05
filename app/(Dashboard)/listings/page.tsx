'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import ListingNavbar from "@/components/ListingNavbar"
import ListingsPage from "@/components/ListingsPage"

const Listings = () => {
  const [search, setSearch] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    axios.get("/api/me")
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
  }, [])

  return (
    <div className="bg-[#F6F6EF] dark:bg-neutral-800 min-h-screen w-full overflow-x-hidden">
      <ListingNavbar search={search} onSearchChange={setSearch} />
      <ListingsPage searchQuery={search} isAuthenticated={isAuthenticated} />
    </div>
  )
}

export default Listings
