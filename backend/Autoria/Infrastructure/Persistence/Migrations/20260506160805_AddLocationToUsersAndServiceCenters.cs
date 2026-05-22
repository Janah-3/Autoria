using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace Autoria.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationToUsersAndServiceCenters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "District",
                table: "ServiceCenters");

            migrationBuilder.DropColumn(
                name: "Governorate",
                table: "ServiceCenters");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "ServiceCenters");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "ServiceCenters");

            migrationBuilder.DropColumn(
                name: "StreetAddress",
                table: "ServiceCenters");

            migrationBuilder.AddColumn<Point>(
                name: "Location",
                table: "users",
                type: "geography",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "ServiceCenters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Point>(
                name: "Location",
                table: "ServiceCenters",
                type: "geography",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "ServiceCenters");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "ServiceCenters");

            migrationBuilder.AddColumn<string>(
                name: "District",
                table: "ServiceCenters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Governorate",
                table: "ServiceCenters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "ServiceCenters",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "ServiceCenters",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "StreetAddress",
                table: "ServiceCenters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
