using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class AddMechanicSpecializationNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ServiceType_ServiceTypeId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceCenterServiceTypes_ServiceType_ServiceTypeId",
                table: "ServiceCenterServiceTypes");

            migrationBuilder.DropTable(
                name: "MECHANIC_SPECIALIZATIONS");

            migrationBuilder.DropTable(
                name: "ServiceType");

            migrationBuilder.CreateTable(
                name: "ServiceTypes",
                columns: table => new
                {
                    ServiceTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceTypes", x => x.ServiceTypeId);
                });

            migrationBuilder.CreateTable(
                name: "mechanicSpecializations",
                columns: table => new
                {
                    MechanicProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mechanicSpecializations", x => new { x.MechanicProfileId, x.ServiceTypeId });
                    table.ForeignKey(
                        name: "FK_mechanicSpecializations_MECHANIC_PROFILES_MechanicProfileId",
                        column: x => x.MechanicProfileId,
                        principalTable: "MECHANIC_PROFILES",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_mechanicSpecializations_ServiceTypes_ServiceTypeId",
                        column: x => x.ServiceTypeId,
                        principalTable: "ServiceTypes",
                        principalColumn: "ServiceTypeId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_mechanicSpecializations_ServiceTypeId",
                table: "mechanicSpecializations",
                column: "ServiceTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ServiceTypes_ServiceTypeId",
                table: "Bookings",
                column: "ServiceTypeId",
                principalTable: "ServiceTypes",
                principalColumn: "ServiceTypeId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceCenterServiceTypes_ServiceTypes_ServiceTypeId",
                table: "ServiceCenterServiceTypes",
                column: "ServiceTypeId",
                principalTable: "ServiceTypes",
                principalColumn: "ServiceTypeId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ServiceTypes_ServiceTypeId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceCenterServiceTypes_ServiceTypes_ServiceTypeId",
                table: "ServiceCenterServiceTypes");

            migrationBuilder.DropTable(
                name: "mechanicSpecializations");

            migrationBuilder.DropTable(
                name: "ServiceTypes");

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

            migrationBuilder.CreateTable(
                name: "ServiceType",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceType", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ServiceType_ServiceTypeId",
                table: "Bookings",
                column: "ServiceTypeId",
                principalTable: "ServiceType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceCenterServiceTypes_ServiceType_ServiceTypeId",
                table: "ServiceCenterServiceTypes",
                column: "ServiceTypeId",
                principalTable: "ServiceType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
