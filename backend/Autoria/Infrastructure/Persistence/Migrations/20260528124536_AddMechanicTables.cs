using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class AddMechanicTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "PartReservations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "CancellationReason",
                table: "PartReservations",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "MECHANIC_PROFILES",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    YearsOfExperience = table.Column<int>(type: "int", nullable: false),
                    NationalIdUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfilePhotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Location = table.Column<Point>(type: "geography", nullable: true),
                    ApprovalStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Rating = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MECHANIC_PROFILES", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MECHANIC_PROFILES_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MECHANIC_SPECIALIZATIONS",
                columns: table => new
                {
                    MechanicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MECHANIC_SPECIALIZATIONS", x => new { x.MechanicId, x.ServiceTypeId });
                    table.ForeignKey(
                        name: "FK_MECHANIC_SPECIALIZATIONS_MECHANIC_PROFILES_MechanicId",
                        column: x => x.MechanicId,
                        principalTable: "MECHANIC_PROFILES",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_MECHANIC_PROFILES_UserId",
                table: "MECHANIC_PROFILES",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MECHANIC_SPECIALIZATIONS");

            migrationBuilder.DropTable(
                name: "MECHANIC_PROFILES");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "PartReservations",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CancellationReason",
                table: "PartReservations",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);
        }
    }
}
