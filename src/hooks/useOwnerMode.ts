import { useState } from 'react'

const OWNER_PARAM = 'owner'

function checkOwnerMode(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get(OWNER_PARAM) === '1'
}

/**
 * Detects "owner mode" via a `?owner=1` URL query param.
 *
 * This is not an authentication mechanism — it's a convenience flag so the
 * site owner can see an extra "Lock as site default" control in the theme
 * picker that regular visitors (recruiters, etc.) never see. Since this is
 * a static site with no backend, the only true cross-visitor persistence
 * is baking a choice into the deployed build's design-systems.json, so the
 * lock action surfaces the exact change to make rather than pretending to
 * silently sync it for everyone.
 */
export function useOwnerMode(): boolean {
  const [isOwner] = useState(checkOwnerMode)
  return isOwner
}
