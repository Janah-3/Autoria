using Microsoft.EntityFrameworkCore;
using Autoria.Infrastructure.Persistence;
using Autoria.features.user.entity;
using Microsoft.AspNetCore.Identity;
using Autoria.Infrastructure.Persistence.Seeding.Seeds;
using Autoria.Infrastructure.Persistence.Seeding;
using Autoria.Infrastructure.Identity.Contracts;
using Autoria.Infrastructure.Identity;
using System.Reflection;
using Autoria.Infrastructure.Identity.Services;

namespace Autoria
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            // Add services to the container.
           

            // Add DbContext 
            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")
                );
            });

            // Add Identity
            builder.Services.AddIdentityCore<User>()
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<AppDbContext>();

            // Controllers & MediatR
            builder.Services.AddControllers();
            builder.Services.AddMediatR(cfg =>
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // JWT Service
            builder.Services.AddScoped<IJwtService, JwtService>();
            builder.Services.Configure<JwtSettings>(
                builder.Configuration.GetSection("JwtSettings"));

            // Data seeder
            builder.Services.AddScoped<DataSeeder>();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();




            var app = builder.Build();

            //auto migration function 
            using (var scope = app.Services.CreateScope())
            {

                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Database.Migrate();

              await scope.ServiceProvider.GetRequiredService<DataSeeder>().SeedAsync();

            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
