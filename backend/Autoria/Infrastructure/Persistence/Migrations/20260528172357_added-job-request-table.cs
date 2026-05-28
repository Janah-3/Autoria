using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class addedjobrequesttable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JOB_REQUESTS",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CarOwnerId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MechanicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CarId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProblemDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    LocationAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JOB_REQUESTS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JOB_REQUESTS_Cars_CarId",
                        column: x => x.CarId,
                        principalTable: "Cars",
                        principalColumn: "CarId");
                    table.ForeignKey(
                        name: "FK_JOB_REQUESTS_MECHANIC_PROFILES_MechanicId",
                        column: x => x.MechanicId,
                        principalTable: "MECHANIC_PROFILES",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JOB_REQUESTS_users_CarOwnerId",
                        column: x => x.CarOwnerId,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_JOB_REQUESTS_CarId",
                table: "JOB_REQUESTS",
                column: "CarId");

            migrationBuilder.CreateIndex(
                name: "IX_JOB_REQUESTS_CarOwnerId",
                table: "JOB_REQUESTS",
                column: "CarOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_JOB_REQUESTS_MechanicId",
                table: "JOB_REQUESTS",
                column: "MechanicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JOB_REQUESTS");
        }
    }
}
