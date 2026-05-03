using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureNoActionDeletes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ServiceCenters_ServiceCenterId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_users_UserId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Cars_users_UserId",
                table: "Cars");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_ServiceCenters_ServiceCenterId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId1",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_ServiceCenters_ServiceCenterId",
                table: "PartReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_SpareParts_SparePartId",
                table: "PartReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_users_ClientId",
                table: "PartReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_RefreshTokens_users_UserId",
                table: "RefreshTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ServiceCenters_ServiceCenterId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_users_UserId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceCenters_users_UserId",
                table: "ServiceCenters");

            migrationBuilder.DropForeignKey(
                name: "FK_SpareParts_users_CreatedById",
                table: "SpareParts");

            migrationBuilder.DropIndex(
                name: "IX_Inventories_SparePartId1",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "SparePartId1",
                table: "Inventories");

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "users",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PartReservations_BookingId",
                table: "PartReservations",
                column: "BookingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ServiceCenters_ServiceCenterId",
                table: "Bookings",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_users_UserId",
                table: "Bookings",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Cars_users_UserId",
                table: "Cars",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_ServiceCenters_ServiceCenterId",
                table: "Inventories",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId",
                table: "Inventories",
                column: "SparePartId",
                principalTable: "SpareParts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_Bookings_BookingId",
                table: "PartReservations",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_ServiceCenters_ServiceCenterId",
                table: "PartReservations",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_SpareParts_SparePartId",
                table: "PartReservations",
                column: "SparePartId",
                principalTable: "SpareParts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_users_ClientId",
                table: "PartReservations",
                column: "ClientId",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshTokens_users_UserId",
                table: "RefreshTokens",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ServiceCenters_ServiceCenterId",
                table: "Reviews",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_users_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceCenters_users_UserId",
                table: "ServiceCenters",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SpareParts_users_CreatedById",
                table: "SpareParts",
                column: "CreatedById",
                principalTable: "users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ServiceCenters_ServiceCenterId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_users_UserId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Cars_users_UserId",
                table: "Cars");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_ServiceCenters_ServiceCenterId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_Bookings_BookingId",
                table: "PartReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_ServiceCenters_ServiceCenterId",
                table: "PartReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_SpareParts_SparePartId",
                table: "PartReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_users_ClientId",
                table: "PartReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_RefreshTokens_users_UserId",
                table: "RefreshTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ServiceCenters_ServiceCenterId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_users_UserId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceCenters_users_UserId",
                table: "ServiceCenters");

            migrationBuilder.DropForeignKey(
                name: "FK_SpareParts_users_CreatedById",
                table: "SpareParts");

            migrationBuilder.DropIndex(
                name: "IX_PartReservations_BookingId",
                table: "PartReservations");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "users");

            migrationBuilder.AddColumn<Guid>(
                name: "SparePartId1",
                table: "Inventories",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_SparePartId1",
                table: "Inventories",
                column: "SparePartId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ServiceCenters_ServiceCenterId",
                table: "Bookings",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_users_UserId",
                table: "Bookings",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Cars_users_UserId",
                table: "Cars",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_ServiceCenters_ServiceCenterId",
                table: "Inventories",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId",
                table: "Inventories",
                column: "SparePartId",
                principalTable: "SpareParts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId1",
                table: "Inventories",
                column: "SparePartId1",
                principalTable: "SpareParts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_ServiceCenters_ServiceCenterId",
                table: "PartReservations",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_SpareParts_SparePartId",
                table: "PartReservations",
                column: "SparePartId",
                principalTable: "SpareParts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_users_ClientId",
                table: "PartReservations",
                column: "ClientId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RefreshTokens_users_UserId",
                table: "RefreshTokens",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ServiceCenters_ServiceCenterId",
                table: "Reviews",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_users_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceCenters_users_UserId",
                table: "ServiceCenters",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SpareParts_users_CreatedById",
                table: "SpareParts",
                column: "CreatedById",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
