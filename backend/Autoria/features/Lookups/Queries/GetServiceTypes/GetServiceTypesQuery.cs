using MediatR;

public record GetServiceTypesQuery : IRequest<List<ServiceTypeDto>>;

public class ServiceTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
}