export interface LocalizedNameFields {
  name: string
  nameTamil?: string | null
}

/** Pick English or Tamil display name based on active locale. */
export function localizedName(item: LocalizedNameFields, isTamil: boolean): string {
  if (isTamil && item.nameTamil) return item.nameTamil
  return item.name
}

/** Resolve farmer name from admin API shapes that expose flat name fields. */
export function localizedFarmerName(
  name: string,
  nameTamil: string | null | undefined,
  isTamil: boolean
): string {
  return localizedName({ name, nameTamil }, isTamil)
}
