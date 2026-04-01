import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
})

const JWT_SECRET = new TextEncoder().encode(process.env.SECRET_KEY || "fallback-secret-key")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = loginSchema.parse(body)

    // Find user by email
    const userResult = await sql(
      `
      SELECT 
        id, username, email, password_hash, first_name, last_name, 
        role, is_active, email_verified, failed_login_attempts, 
        locked_until, last_login
      FROM users 
      WHERE email = $1 AND deleted_at IS NULL
      `,
      [email],
    )

    if (userResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          message: "Email or password is incorrect",
        },
        { status: 401 },
      )
    }

    const user = userResult[0]

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const lockTimeRemaining = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          success: false,
          error: "Account locked",
          message: `Account is locked for ${lockTimeRemaining} more minutes due to too many failed login attempts`,
        },
        { status: 423 },
      )
    }

    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: "Account disabled",
          message: "Your account has been disabled. Please contact support.",
        },
        { status: 403 },
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1
      let lockUntil = null

      // Lock account after 5 failed attempts for 30 minutes
      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }

      await sql(
        `
        UPDATE users 
        SET failed_login_attempts = $1, locked_until = $2, updated_at = NOW()
        WHERE id = $3
        `,
        [newFailedAttempts, lockUntil, user.id],
      )

      // Log failed login attempt
      await sql(
        `
        INSERT INTO user_activity (user_id, activity_type, description, metadata, created_at)
        VALUES ($1, 'login_failed', 'Failed login attempt', $2, NOW())
        `,
        [user.id, JSON.stringify({ email, ip: request.ip, userAgent: request.headers.get("user-agent") })],
      )

      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
          message: "Email or password is incorrect",
          attemptsRemaining: Math.max(0, 5 - newFailedAttempts),
        },
        { status: 401 },
      )
    }

    // Reset failed login attempts on successful login
    await sql(
      `
      UPDATE users 
      SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [user.id],
    )

    // Create JWT token
    const expirationTime = rememberMe ? "30d" : "24h"
    const expirationSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expirationSeconds)
      .sign(JWT_SECRET)

    // Create session record
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + expirationSeconds * 1000)

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
        user.id,
        await bcrypt.hash(token, 10),
        expiresAt,
        request.ip || "unknown",
        request.headers.get("user-agent") || "unknown",
      ],
    )

    // Log successful login
    await sql(
      `
      INSERT INTO user_activity (user_id, activity_type, description, metadata, created_at)
      VALUES ($1, 'login_success', 'Successful login', $2, NOW())
      `,
      [
        user.id,
        JSON.stringify({
          sessionId,
          ip: request.ip,
          userAgent: request.headers.get("user-agent"),
          rememberMe,
        }),
      ],
    )

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      emailVerified: user.email_verified,
      lastLogin: user.last_login,
    }

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: userData,
        sessionId,
        expiresAt: expiresAt.toISOString(),
      },
      message: "Login successful",
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expirationSeconds,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("POST /api/auth/login error:", error)

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
        error: "Login failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
