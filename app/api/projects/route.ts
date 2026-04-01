import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  description: z.string().max(1000).optional(),
  userId: z.number().int().positive("Valid user ID is required"),
  repository: z.string().url().optional(),
  framework: z.enum(["react", "nextjs", "vue", "angular", "svelte", "vanilla"]).default("react"),
  status: z.enum(["planning", "development", "testing", "deployed", "archived"]).default("planning"),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).max(10).default([]),
  metadata: z.record(z.any()).optional(),
})

const updateProjectSchema = createProjectSchema.partial()

// GET /api/projects - List projects with advanced filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 100)
    const search = searchParams.get("search") || ""
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const framework = searchParams.get("framework")
    const isPublic = searchParams.get("isPublic")
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || []
    const sortBy = searchParams.get("sortBy") || "updated_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    // Build dynamic query
    let whereClause = "WHERE p.deleted_at IS NULL"
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (userId) {
      whereClause += ` AND p.user_id = $${paramIndex}`
      params.push(Number.parseInt(userId))
      paramIndex++
    }

    if (status) {
      whereClause += ` AND p.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (framework) {
      whereClause += ` AND p.framework = $${paramIndex}`
      params.push(framework)
      paramIndex++
    }

    if (isPublic !== null) {
      whereClause += ` AND p.is_public = $${paramIndex}`
      params.push(isPublic === "true")
      paramIndex++
    }

    if (tags.length > 0) {
      whereClause += ` AND p.tags && $${paramIndex}`
      params.push(tags)
      paramIndex++
    }

    // Validate sort column
    const allowedSortColumns = ["name", "created_at", "updated_at", "status", "framework"]
    const safeSortBy = allowedSortColumns.includes(sortBy) ? `p.${sortBy}` : "p.updated_at"
    const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC"

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      ${whereClause}
    `
    const countResult = await sql(countQuery, params)
    const total = Number.parseInt(countResult[0].total)

    // Get projects with user information
    const projectsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.user_id,
        p.repository,
        p.framework,
        p.status,
        p.is_public,
        p.tags,
        p.metadata,
        p.created_at,
        p.updated_at,
        u.username,
        u.email as user_email,
        (
          SELECT COUNT(*)
          FROM deployments d
          WHERE d.project_id = p.id AND d.status = 'success'
        ) as deployment_count,
        (
          SELECT MAX(created_at)
          FROM deployments d
          WHERE d.project_id = p.id
        ) as last_deployment
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(limit, offset)

    const projects = await sql(projectsQuery, params)

    // Get aggregated statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'deployed' THEN 1 END) as deployed_projects,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_projects,
        COUNT(DISTINCT user_id) as unique_users
      FROM projects
      WHERE deleted_at IS NULL
    `
    const stats = await sql(statsQuery)

    return NextResponse.json({
      success: true,
      data: {
        projects,
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
          userId,
          status,
          framework,
          isPublic,
          tags,
          sortBy: safeSortBy,
          sortOrder: safeSortOrder,
        },
        statistics: stats[0],
      },
    })
  } catch (error) {
    console.error("GET /api/projects error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // Verify user exists
    const userExists = await sql("SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL", [validatedData.userId])

    if (userExists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "The specified user does not exist",
        },
        { status: 404 },
      )
    }

    // Check for duplicate project name for the user
    const duplicateCheck = await sql(
      "SELECT id FROM projects WHERE user_id = $1 AND name = $2 AND deleted_at IS NULL",
      [validatedData.userId, validatedData.name],
    )

    if (duplicateCheck.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Project name already exists",
          message: "You already have a project with this name",
        },
        { status: 409 },
      )
    }

    // Create project
    const result = await sql(
      `
      INSERT INTO projects (
        name, description, user_id, repository, framework, status, 
        is_public, tags, metadata, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
      `,
      [
        validatedData.name,
        validatedData.description || null,
        validatedData.userId,
        validatedData.repository || null,
        validatedData.framework,
        validatedData.status,
        validatedData.isPublic,
        JSON.stringify(validatedData.tags),
        validatedData.metadata ? JSON.stringify(validatedData.metadata) : null,
      ],
    )

    const newProject = result[0]

    // Log project creation activity
    await sql(
      `
      INSERT INTO user_activity (user_id, activity_type, description, metadata, created_at)
      VALUES ($1, 'project_created', 'New project created', $2, NOW())
      `,
      [validatedData.userId, JSON.stringify({ projectId: newProject.id, projectName: newProject.name })],
    )

    return NextResponse.json(
      {
        success: true,
        data: newProject,
        message: "Project created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("POST /api/projects error:", error)

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
        error: "Failed to create project",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT /api/projects - Bulk update projects
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectIds, updates } = body

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project IDs",
          message: "projectIds must be a non-empty array",
        },
        { status: 400 },
      )
    }

    const validatedUpdates = updateProjectSchema.parse(updates)

    // Build dynamic update query
    const updateFields: string[] = []
    const params: any[] = []
    let paramIndex = 1

    Object.entries(validatedUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbColumn = key.replace(/([A-Z])/g, "_$1").toLowerCase()
        if (key === "tags" || key === "metadata") {
          updateFields.push(`${dbColumn} = $${paramIndex}`)
          params.push(JSON.stringify(value))
        } else {
          updateFields.push(`${dbColumn} = $${paramIndex}`)
          params.push(value)
        }
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

    updateFields.push(`updated_at = NOW()`)

    const placeholders = projectIds.map((_, index) => `$${paramIndex + index}`).join(", ")
    params.push(...projectIds)

    const query = `
      UPDATE projects
      SET ${updateFields.join(", ")}
      WHERE id IN (${placeholders}) AND deleted_at IS NULL
      RETURNING id, name, status, framework, updated_at
    `

    const result = await sql(query, params)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Updated ${result.length} projects successfully`,
    })
  } catch (error) {
    console.error("PUT /api/projects error:", error)

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
        error: "Failed to update projects",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/projects - Bulk delete projects
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectIds, permanent = false } = body

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project IDs",
          message: "projectIds must be a non-empty array",
        },
        { status: 400 },
      )
    }

    const placeholders = projectIds.map((_, index) => `$${index + 1}`).join(", ")

    let query: string
    if (permanent) {
      // Delete related data first
      await sql(`DELETE FROM deployments WHERE project_id IN (${placeholders})`, projectIds)

      query = `
        DELETE FROM projects
        WHERE id IN (${placeholders})
        RETURNING id, name, user_id
      `
    } else {
      query = `
        UPDATE projects
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id IN (${placeholders}) AND deleted_at IS NULL
        RETURNING id, name, user_id
      `
    }

    const result = await sql(query, projectIds)

    // Log deletion activities
    for (const project of result) {
      await sql(
        `
        INSERT INTO user_activity (user_id, activity_type, description, metadata, created_at)
        VALUES ($1, 'project_deleted', 'Project deleted', $2, NOW())
        `,
        [
          project.user_id,
          JSON.stringify({
            projectId: project.id,
            projectName: project.name,
            permanent,
          }),
        ],
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${permanent ? "Permanently deleted" : "Soft deleted"} ${result.length} projects successfully`,
    })
  } catch (error) {
    console.error("DELETE /api/projects error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete projects",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
