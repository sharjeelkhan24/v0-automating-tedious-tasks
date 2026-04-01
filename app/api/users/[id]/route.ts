import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.enum(["user", "admin", "developer"]).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/users/[id] - Get user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    const {
      params: { id },
    } = request.nextUrl

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
          message: "User ID must be a valid number",
        },
        { status: 400 },
      )
    }

    const result = await sql(
      `
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
        updated_at,
        (
          SELECT COUNT(*)
          FROM projects
          WHERE user_id = users.id AND deleted_at IS NULL
        ) as project_count,
        (
          SELECT COUNT(*)
          FROM user_sessions
          WHERE user_id = users.id AND expires_at > NOW()
        ) as active_sessions
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [userId],
    )

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "No user found with the provided ID",
        },
        { status: 404 },
      )
    }

    const user = result[0]

    // Get user's recent activity
    const recentActivity = await sql(
      `
      SELECT 
        activity_type,
        description,
        metadata,
        created_at
      FROM user_activity
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [userId],
    )

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        recentActivity,
      },
    })
  } catch (error) {
    console.error(`GET /api/users/${params.id} error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT /api/users/[id] - Update user by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    const {
      params: { id },
    } = request.nextUrl

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
          message: "User ID must be a valid number",
        },
        { status: 400 },
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await sql("SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL", [userId])

    if (existingUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "No user found with the provided ID",
        },
        { status: 404 },
      )
    }

    // Check for conflicts if email or username is being updated
    if (validatedData.email || validatedData.username) {
      const conflictQuery = `
        SELECT id, email, username
        FROM users
        WHERE id != $1 AND deleted_at IS NULL
        AND (email = $2 OR username = $3)
      `
      const conflicts = await sql(conflictQuery, [userId, validatedData.email || "", validatedData.username || ""])

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Conflict detected",
            message: "Another user already has this email or username",
          },
          { status: 409 },
        )
      }
    }

    // Build dynamic update query
    const updateFields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert camelCase to snake_case
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

    // Add updated_at and user ID
    updateFields.push(`updated_at = NOW()`)
    params.push(userId)

    const query = `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING id, username, email, first_name, last_name, role, is_active, updated_at
    `

    const result = await sql(query, params)

    // Log the update activity
    await sql(
      `
      INSERT INTO user_activity (user_id, activity_type, description, metadata, created_at)
      VALUES ($1, 'profile_update', 'User profile updated', $2, NOW())
      `,
      [userId, JSON.stringify({ updatedFields: Object.keys(validatedData) })],
    )

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "User updated successfully",
    })
  } catch (error) {
    console.error(`PUT /api/users/${params.id} error:`, error)

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
        error: "Failed to update user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/users/[id] - Delete user by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get("permanent") === "true"
    const {
      params: { id },
    } = request.nextUrl

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
          message: "User ID must be a valid number",
        },
        { status: 400 },
      )
    }

    // Check if user exists
    const existingUser = await sql("SELECT id, username, email FROM users WHERE id = $1 AND deleted_at IS NULL", [
      userId,
    ])

    if (existingUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "No user found with the provided ID",
        },
        { status: 404 },
      )
    }

    let result
    if (permanent) {
      // Permanent deletion - also delete related data
      await sql("DELETE FROM user_activity WHERE user_id = $1", [userId])
      await sql("DELETE FROM user_sessions WHERE user_id = $1", [userId])
      await sql("UPDATE projects SET deleted_at = NOW() WHERE user_id = $1", [userId])

      result = await sql("DELETE FROM users WHERE id = $1 RETURNING id, username, email", [userId])
    } else {
      // Soft deletion
      result = await sql(
        `
        UPDATE users
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id, username, email
        `,
        [userId],
      )

      // Log the deletion activity
      await sql(
        `
        INSERT INTO user_activity (user_id, activity_type, description, created_at)
        VALUES ($1, 'account_deleted', 'User account soft deleted', NOW())
        `,
        [userId],
      )
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: `User ${permanent ? "permanently deleted" : "soft deleted"} successfully`,
    })
  } catch (error) {
    console.error(`DELETE /api/users/${params.id} error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
