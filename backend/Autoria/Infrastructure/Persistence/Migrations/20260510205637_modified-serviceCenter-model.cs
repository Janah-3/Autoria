using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class modifiedserviceCentermodel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Rating",
                table: "ServiceCenters",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<Guid>(
                name: "BrandId",
                table: "Cars",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cars_BrandId",
                table: "Cars",
                column: "BrandId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cars_CarBrands_BrandId",
                table: "Cars",
                column: "BrandId",
                principalTable: "CarBrands",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cars_CarBrands_BrandId",
                table: "Cars");

            migrationBuilder.DropIndex(
                name: "IX_Cars_BrandId",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "ServiceCenters");

            migrationBuilder.DropColumn(
                name: "BrandId",
                table: "Cars");
        }
    }
}
