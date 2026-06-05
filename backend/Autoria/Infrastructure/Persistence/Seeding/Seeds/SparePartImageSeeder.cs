using Autoria.features.SpareParts.Entities;
using Microsoft.EntityFrameworkCore;

namespace Autoria.Infrastructure.Persistence.Seeding.Seeds
{
    public class SparePartImageSeeder
    {
        private readonly AppDbContext _context;

        public SparePartImageSeeder(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {

        var images = new List<SparePartImage>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111001"),
                    Url = "https://s7g10.scene7.com/is/image/mannhummel/W_712.75-filter-with-box?qlt=82&ts=1774293617538&dpr=off"
                },

                new()
                {
                    Id = Guid.NewGuid(),
                    SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111002"),
                    Url = "https://www.bremboparts.com/images/cluster/pad/pad-xtra-ceramic.png"
                },

                new()
                {
                    Id = Guid.NewGuid(),
                    SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111003"),
                    Url = "https://ae-pic-a1.aliexpress-media.com/kf/S5ab384465e9f4e6aaa44d700b6b81ee5G.jpg"
                },

                new()
                {
                    Id = Guid.NewGuid(),
                    SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111004"),
                    Url = "https://m.media-amazon.com/images/I/81fFCPeRn7L.jpg"
                },

                new()
                {
                    Id = Guid.NewGuid(),
                    SparePartId = Guid.Parse("11111111-1111-1111-1111-111111111005"),
                    Url = "https://i5.walmartimages.com/seo/Castrol-EDGE-High-Mileage-5W-30-Advanced-Full-Synthetic-Motor-Oil-5-Quarts_b5fa007d-4bff-477f-84bc-2f02ab295e13.00ce219c91e8e218d2701ae4b301e40f.jpeg"
                }
            };

        await _context.SparePartImages.AddRangeAsync(images);
        await _context.SaveChangesAsync();
    }
}
}
