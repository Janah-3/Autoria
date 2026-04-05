using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class removedisVerifiedprop : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVerified",
                table: "users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVerified",
                table: "users",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
