using System.Reflection;
using System.Text;
using Autoria.features.MileageTracking.BackgroundJobs;
using Autoria.features.Notifications.Services;
using Autoria.features.Payments.Services;
using Autoria.features.SpareParts.Services;
using Autoria.features.Subscribtion.Services;
using Autoria.Infrastructure.AI;
using Autoria.Infrastructure.AI.Contracts;
using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Email.Models;
using Autoria.Infrastructure.Email.Services;
using Autoria.Infrastructure.Identity;
using Autoria.Infrastructure.Identity.Contracts;
using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Identity.Services;
using Autoria.Infrastructure.Persistence;
using Autoria.Infrastructure.Persistence.Seeding;
using Autoria.Infrastructure.Persistence.Services;
using Autoria.shared.Behaviors;
using Autoria.shared.Contracts;
using Autoria.shared.Converters;
using Autoria.shared.Middlewares;
using Autoria.shared.Settings;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Autoria
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddDataProtection();
            builder.Services.AddHttpContextAccessor();

            builder.Services.AddScoped<GlobalExceptionHandler>();

            // Add services to the container.
            builder.Services.AddScoped<IAdminLogService, AdminLogService>();
            builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

            // Add DbContext 
            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")
                    , o => o.UseNetTopologySuite()
                );
            });

            // Add Identity
            builder.Services.AddIdentityCore<User>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders(); ;

            // Controllers & MediatR
            builder.Services.AddControllers()
                  .AddJsonOptions(options =>
                  {
                      options.JsonSerializerOptions.Converters.Add(
                          new System.Text.Json.Serialization.JsonStringEnumConverter()
                      );

                      options.JsonSerializerOptions.Converters.Add(
                          new TimeOnlyJsonConverter()
                      );
                  });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // JWT Service
            builder.Services.AddScoped<IJwtService, JwtService>();
            builder.Services.Configure<JwtSettings>(
                builder.Configuration.GetSection("JwtSettings"));

            //Gemini service
            builder.Services.AddHttpClient<IGeminiService,GeminiService>();
            builder.Services.Configure<GeminiSettings>(
                 builder.Configuration.GetSection("GeminiSettings")
                );

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
             {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                    ValidAudience = builder.Configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"])
                    )
                };
            });

            // MediatR
            builder.Services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());

                //  register validation pipeline
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            });

            // FluentValidation — auto-registers all validators in the assembly
            builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // Data seeder
            builder.Services.AddScoped<DataSeeder>();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            //mail
            builder.Services.Configure<MailSettings>(
            builder.Configuration.GetSection("MailSettings"));

            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<INotificationService, NotificationService>();

            builder.Services.Configure<CloudinarySettings>(
            builder.Configuration.GetSection("Cloudinary"));
            builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
            builder.Services.AddScoped<IPremiumGuard, PremiumGuard>();
            builder.Services.AddScoped<IMockPaymentGateway, MockPaymentGateway>();
            builder.Services.AddHostedService<MileageReminderJob>();
            builder.Services.AddScoped<IImageStorageService, LocalImageStorageService>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });

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

            app.UseMiddleware<GlobalExceptionHandler>();

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.UseStaticFiles();

            app.UseAuthentication();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();

            


        }
    }
}
