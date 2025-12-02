export function validateSuggestionReq(data: any) {
  const { prompt } = data;
  if (!prompt) {
    return { error: "Prompt is required", status: 400 };
  }

  if (prompt.length > 180) {
    return { error: "Prompt should not exceed 180 characters" };
  }

  return { valid: true };
}

export function validateDomainsRatingReq(data: any) {
  const { domain: name, rating } = data.domainRating;
  if (!name || name.length > 150) {
    return {
      error: "domain name should not exceed 150 characters",
    };
  } else if (rating < 1 || rating > 10) {
    return { error: "rating should be between 1 to 10" };
  }
  return { valid: true };
}

export function validateRegisterWithEmail(data: any) {
  const { email, password } = data;
  if (email.length > 150) {
    return { error: "Email must not exceed 150 characters", status: 400 };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  if (!password || typeof password !== "string") {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  if (password.length > 30) {
    return { error: "Password must not exceed 100 characters" };
  }

  return { valid: true };
}

export function validateEmailVerification(data: any) {
  const { email } = data;
  if (email.length > 150) {
    return { error: "Email must not exceed 150 characters", status: 400 };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  return { valid: true };
}
