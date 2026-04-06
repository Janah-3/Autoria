using System;
using System.Text.Json.Serialization;
using Autoria.features.user.entity;

namespace Autoria.Infrastructure.Identity.entities
{
    public class RefreshToken
    {
        public Guid id { get; set; }
        public string token { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }

        public string UserId { get; set; } = default!;
        [JsonIgnore]
        public User User { get; set; } = default!;       
    }
}
