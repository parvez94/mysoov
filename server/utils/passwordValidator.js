function validatePassword(password) {
  // Define complexity requirements
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)

  // Validate password
  if (password.length < minLength) {
    return "Password must be at least 8 characters long."
  } else if (!hasUpperCase || !hasLowerCase) {
    return "Password must contain both uppercase and lowercase letters."
  } else if (!hasNumber) {
    return "Password must contain at least one number."
  } else if (!hasSpecialChar) {
    return "Password must contain at least one special character."
  } else {
    return null // Password meets complexity requirements
  }
}

export default validatePassword
