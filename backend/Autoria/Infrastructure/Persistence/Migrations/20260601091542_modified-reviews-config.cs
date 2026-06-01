using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class modifiedreviewsconfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ServiceCenters_ServiceCenterId1",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_ServiceCenterId1",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "ServiceCenterId1",
                table: "Reviews");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ServiceCenterId1",
                table: "Reviews",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ServiceCenterId1",
                table: "Reviews",
                column: "ServiceCenterId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ServiceCenters_ServiceCenterId1",
                table: "Reviews",
                column: "ServiceCenterId1",
                principalTable: "ServiceCenters",
                principalColumn: "Id");
        }
    }
}
