using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class addedcitydistrictgovernoratetoServiceCenter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "ServiceCenters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Gvernorate",
                table: "ServiceCenters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "District",
                table: "ServiceCenters");

            migrationBuilder.DropColumn(
                name: "Gvernorate",
                table: "ServiceCenters");
        }
    }
}
