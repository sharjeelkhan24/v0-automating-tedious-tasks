import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"

// Database connection
const sql = neon(process.env.DATABASE_URL!)

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  role: z.enum(["user", "admin", "developer"]).default("user"),
})

const updateUserSchema = createUserSchema.partial()

// GET /api/users - List all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 100)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    // Build dynamic query
    let whereClause = "WHERE deleted_at IS NULL"
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (role) {
      whereClause += ` AND role = $${paramIndex}`
      params.push(role)
      paramIndex++
    }

    // Validate sort column to prevent SQL injection
    const allowedSortColumns = ["username", "email", "created_at", "updated_at", "first_name", "last_name"]
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "created_at"
    const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC"

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `
    const countResult = await sql(countQuery, params)
    const total = Number.parseInt(countResult[0].total)

    // Get users
    const usersQuery = `
      SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        role,
        is_active,
        email_verified,
        last_login,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(limit, offset)

    const users = await sql(usersQuery, params)

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        filters: {
          search,
          role,
          sortBy: safeSortBy,
          sortOrder: safeSortOrder,
        },
      },
    })
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await sql("SELECT id FROM users WHERE email = $1 OR username = $2", [
      validatedData.email,
      validatedData.username,
    ])

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
          message: "A user with this email or username already exists",
        },
        { status: 409 },
      )
    }

    // Create user
    const result = await sql(
      `
      INSERT INTO users (username, email, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, username, email, first_name, last_name, role, is_active, created_at
      `,
      [
        validatedData.username,
        validatedData.email,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.role,
      ],
    )

    const newUser = result[0]

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("POST /api/users error:", error)

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
        error: "Failed to create user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT /api/users - Bulk update users
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userIds, updates } = body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user IDs",
          message: "userIds must be a non-empty array",
        },
        { status: 400 },
      )
    }

    const validatedUpdates = updateUserSchema.parse(updates)

    // Build dynamic update query
    const updateFields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    Object.entries(validatedUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert camelCase to snake_case for database columns
        const dbColumn = key.replace(/([A-Z])/g, "_$1").toLowerCase()
        updateFields.push(`${dbColumn} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No updates provided",
          message: "At least one field must be provided for update",
        },
        { status: 400 },
      )
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`)

    // Add user IDs to params
    const placeholders = userIds.map((_, index) => `$${paramIndex + index}`).join(", ")
    params.push(...userIds)

    const query = `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id IN (${placeholders}) AND deleted_at IS NULL
      RETURNING id, username, email, first_name, last_name, role, is_active, updated_at
    `

    const result = await sql(query, params)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Updated ${result.length} users successfully`,
    })
  } catch (error) {
    console.error("PUT /api/users error:", error)

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
        error: "Failed to update users",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/users - Bulk soft delete users
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userIds, permanent = false } = body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user IDs",
          message: "userIds must be a non-empty array",
        },
        { status: 400 },
      )
    }

    const placeholders = userIds.map((_, index) => `$${index + 1}`).join(", ")

    let query: string
    if (permanent) {
      // Permanent deletion
      query = `
        DELETE FROM users
        WHERE id IN (${placeholders})
        RETURNING id, username, email
      `
    } else {
      // Soft deletion
      query = `
        UPDATE users
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id IN (${placeholders}) AND deleted_at IS NULL
        RETURNING id, username, email
      `
    }

    const result = await sql(query, userIds)

    return NextResponse.json({
      success: true,
      data: result,
      message: `${permanent ? "Permanently deleted" : "Soft deleted"} ${result.length} users successfully`,
    })
  } catch (error) {
    console.error("DELETE /api/users error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete users",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
