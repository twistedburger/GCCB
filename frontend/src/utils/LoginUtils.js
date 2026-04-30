export async function getSSOProviders(search) {
  const response = await fetch(
    `${process.env.VITE_API_BASE_URL}/sso_list?search=${search}`
  )
  if (!response.ok) {
    const errorText = await response.text()
    console.log(response.status + ' ' + errorText)
    return []
  }
  const responseJSON = await response.json()
  if (responseJSON) {
    return responseJSON.map(school => ({
      value: school.sso_connection,
      label: school.school_name,
    }))
  }
  return []
}

export const redirect = url => {
  window.location.href = url
}
