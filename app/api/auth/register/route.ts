import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const sql = neon(process.env.DATABASE_URL!)

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
})

const JWT_SECRET = new TextEncoder().encode(process.env.SECRET_KEY || "fallback-secret-key")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await sql("SELECT id, email, username FROM users WHERE email = $1 OR username = $2", [
      validatedData.email,
      validatedData.username,
    ])

    if (existingUser.length > 0) {
      const existing = existingUser[0]
      const conflictField = existing.email === validatedData.email ? "email" : "username"

      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
          message: `A user with this ${conflictField} already exists`,
          field: conflictField,
        },
        { status: 409 },
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(validatedData.password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Weak password",
          message: "Password does not meet security requirements",
          requirements: passwordValidation.requirements,
        },
        { status: 400 },
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds)

    // Generate email verification token
    const emailVerificationToken = crypto.randomUUID()

    // Create user
    const result = await sql(
      `
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, 
        email_verification_token, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, username, email, first_name, last_name, created_at
      `,
      [
        validatedData.username,
        validatedData.email,
        passwordHash,
        validatedData.firstName,
        validatedData.lastName,
        emailVerificationToken,
      ],
    )

    const newUser = result[0]

    // Create JWT token for immediate login
    const token = await new SignJWT({
      userId: newUser.id,
      email: newUser.email,
      role: "user",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    // Create session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await sql(
      `
      INSERT INTO user_sessions (
        id, user_id, token_hash, expires_at, ip_address, 
        user_agent, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `,
      [
        sessionId,
        newUser.id,
        await bcrypt.hash(token, 10),
        expiresAt,
        request.ip || "unknown",
        request.headers.get("user-agent") || "unknown",
      ],
    )

    // Log registration activity
    await sql(
      `
      INSERT INTO user_activity (user_id, activity_type, description, metadata, created_at)
      VALUES ($1, 'account_created', 'New user account created', $2, NOW())
      `,
      [
        newUser.id,
        JSON.stringify({
          ip: request.ip,
          userAgent: request.headers.get("user-agent"),
          emailVerificationToken,
        }),
      ],
    )

    // Send verification email (in a real app, you'd use an email service)
    // For now, we'll just log it
    console.log(`Email verification token for ${newUser.email}: ${emailVerificationToken}`)

    // Prepare response data
    const userData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: "user",
      emailVerified: false,
      createdAt: newUser.created_at,
    }

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: userData,
          sessionId,
          expiresAt: expiresAt.toISOString(),
          emailVerificationRequired: true,
        },
        message: "Account created successfully. Please check your email to verify your account.",
      },
      { status: 201 },
    )

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("POST /api/auth/register error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Registration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function validatePasswordStrength(password: string) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noCommonPatterns: !/(123|abc|password|qwerty)/i.test(password),
  }

  const isValid = Object.values(requirements).every(Boolean)

  return {
    isValid,
    requirements: {
      "At least 8 characters": requirements.minLength,
      "Contains uppercase letter": requirements.hasUppercase,
      "Contains lowercase letter": requirements.hasLowercase,
      "Contains numbers": requirements.hasNumbers,
      "Contains special characters": requirements.hasSpecialChars,
      "No common patterns": requirements.noCommonPatterns,
    },
  }
}
