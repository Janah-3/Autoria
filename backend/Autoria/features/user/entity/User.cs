using System;
using Autoria.Infrastructure.Identity.entities;
using Microsoft.AspNetCore.Identity;

namespace Autoria.features.user.entity
{
    public class User : IdentityUser
    {
        public string FullName { get; set; } = default!;
        public bool IsBanned { get; set; }
        public DateTime Created_At { get; set; }

        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
