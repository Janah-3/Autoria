using Autoria.shared.Enums;

public class ServiceCenterSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string Governorate { get; set; }
    public string Phone { get; set; }
    public ServiceCenterType Type { get; set; }
    public string? CoverPhoto { get; set; }
    public List<string> ServiceTypes { get; set; }
    public List<string> CarBrands { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}