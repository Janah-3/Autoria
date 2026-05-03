using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class FixCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_ServiceCenters_ServiceCenterId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId",
                table: "Inventories");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_ServiceCenters_ServiceCenterId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId",
                table: "Inventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId1",
                table: "Inventories");

            migrationBuilder.DropIndex(
                name: "IX_Inventories_SparePartId1",
                table: "Inventories");

            migrationBuilder.DropColumn(
                name: "SparePartId1",
                table: "Inventories");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_ServiceCenters_ServiceCenterId",
                table: "Inventories",
                column: "ServiceCenterId",
                principalTable: "ServiceCenters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Inventories_SpareParts_SparePartId",
                table: "Inventories",
                column: "SparePartId",
                principalTable: "SpareParts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
