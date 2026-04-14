namespace Autoria.features.user.Commands.UpdateUser
{
    public record UpdateUserRequest(
    string? FullName,
    string? PhoneNumber,
    string? Role
);

}
