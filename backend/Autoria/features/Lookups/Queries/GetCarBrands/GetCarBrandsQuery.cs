using MediatR;

public record GetCarBrandsQuery : IRequest<List<CarBrandDto>>;

public class CarBrandDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
}