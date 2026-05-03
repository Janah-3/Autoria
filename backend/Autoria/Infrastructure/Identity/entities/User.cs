using System;
using Autoria.features.Car.Entity;
using Microsoft.AspNetCore.Identity;

namespace Autoria.Infrastructure.Identity.entities
{
    public class User : IdentityUser
    {
     
        public string FullName { get; set; } = default!;
        public bool IsBanned { get; set; }
        public DateTime Created_At { get; set; }

        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public ICollection<Car> Cars { get; set; } = new List<Car>();
    }
}
