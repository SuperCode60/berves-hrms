<?php

/**
 * @OA\OpenApi(
 *     @OA\Info(
 *         version="1.0.0",
 *         title="Berves HRMS API Documentation",
 *         description="Human Resource Management System API for Berves Engineering Limited",
 *         termsOfService="http://berves.com/terms/",
 *         @OA\Contact(
 *             email="admin@berves.com",
 *             name="API Support"
 *         ),
 *         @OA\License(
 *             name="Apache 2.0",
 *             url="http://www.apache.org/licenses/LICENSE-2.0.html"
 *         )
 *     ),
 *     @OA\Server(
 *         url=L5_SWAGGER_CONST_HOST,
 *         description="Berves HRMS API Server"
 *     ),
 *     @OA\Tag(
 *         name="Authentication",
 *         description="Authentication endpoints"
 *     ),
 *     @OA\Tag(
 *         name="Employees",
 *         description="Employee management endpoints"
 *     ),
 *     @OA\Tag(
 *         name="Payroll",
 *         description="Payroll management endpoints"
 *     ),
 *     @OA\Tag(
 *         name="Attendance",
 *         description="Attendance tracking endpoints"
 *     ),
 *     @OA\Tag(
 *         name="Leave",
 *         description="Leave management endpoints"
 *     ),
 *     @OA\SecurityScheme(
 *         type="http",
 *         scheme="bearer",
 *         bearerFormat="JWT",
 *         securityScheme="sanctum",
 *         description="Laravel Sanctum token authentication"
 *     ),
 *     @OA\Components(
 *         schemas="schemas"
 *     )
 * )
 */
