using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class FixPartReservationCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_users_ClientId",
                table: "PartReservations");

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_users_ClientId",
                table: "PartReservations",
                column: "ClientId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PartReservations_users_ClientId",
                table: "PartReservations");

            migrationBuilder.AddForeignKey(
                name: "FK_PartReservations_users_ClientId",
                table: "PartReservations",
                column: "ClientId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
