using Autoria.features.auth.Dtos;
using Autoria.Features.Mechanics.Entities;
using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Email.Templates;
using Autoria.Infrastructure.Identity.Contracts;
using Autoria.Infrastructure.Identity.entities;
using Autoria.Infrastructure.Persistence;
using Autoria.shared.constants;
using Autoria.shared.Contracts;
using Autoria.shared.Enums;
using Autoria.shared.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace Autoria.features.auth.Commands.RegisterMechanic
{
    public class RegisterMechanicHandler : IRequestHandler<RegisterMechanicCommand, AuthResponseDto>
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtService _jwt;
        private readonly IEmailService _emailService;
        private readonly AppDbContext _dbContext;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly GeometryFactory _geometryFactory;

        public RegisterMechanicHandler(
            UserManager<User> userManager,
            IJwtService jwt,
            IEmailService emailService,
            AppDbContext dbContext,
            ICloudinaryService cloudinary)
        {
            _userManager = userManager;
            _jwt = jwt;
            _emailService = emailService;
            _dbContext = dbContext;
            _cloudinaryService = cloudinary;
            _geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        }

        public async Task<AuthResponseDto> Handle(RegisterMechanicCommand request, CancellationToken cancellationToken)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                throw new ConflictException("A user with this email already exists.");

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                UserName = request.Email,
                PhoneNumber = request.PhoneNumber,
                Created_At = DateTime.UtcNow,
                IsBanned = false,
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                throw new BadRequestException("User creation failed", errors);
            }

            await _userManager.AddToRoleAsync(user, Roles.User);

            var profilePhotoUrl = await _cloudinaryService
              .UploadImageAsync(request.ProfilePhoto, "mechanic_photos");

            var nationalIdUrl = await _cloudinaryService
                .UploadImageAsync(request.NationalId, "mechanic_documents");

            var location = _geometryFactory.CreatePoint(
                new Coordinate(request.Longitude, request.Latitude));

            var profile = new MechanicProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                YearsOfExperience = request.YearsOfExperience,
                City = request.City,
                Location = location,
                ProfilePhotoUrl = profilePhotoUrl,
                NationalIdUrl = nationalIdUrl,
                ApprovalStatus = ApprovalStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Specializations = request.SpecializationIds.Select(id => new MechanicSpecialization
                {
                    ServiceTypeId = id
                }).ToList()
            };

            await _dbContext.MechanicProfiles.AddAsync(profile, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var verificationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var verificationLink = $"http://localhost:3000/emailVAR?token={Uri.EscapeDataString(verificationToken)}&email={user.Email}";

            await _emailService.SendMailAsync(
                to: user.Email,
                subject: "Verify Your Autoria Email",
                body: EmailTemplates.VerifyEmail(user.FullName, verificationLink)
            );

            return await _jwt.GenerateToken(user);
        }

       
    }
}