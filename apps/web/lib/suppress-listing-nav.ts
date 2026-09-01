/** Blocks listing-card navigation after a dialog/drawer overlay dismiss (click-through). */
let suppressUntil = 0

export function suppressListingNav(ms = 400) {
    suppressUntil = Date.now() + ms
}

export function isListingNavSuppressed() {
    return Date.now() < suppressUntil
}
