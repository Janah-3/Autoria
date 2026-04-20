using Autoria.features.ServiceCenter.Commands.CreateServiceCenter;
using Autoria.shared.constants;
using System.Security.Claims;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Autoria.features.ServiceCenter.Commands.UploadDocuments;
using Autoria.features.ServiceCenter.Commands.UpdateServiceTypes;
using Autoria.features.ServiceCenter.Commands.UpdateCarBrands;
using Autoria.features.ServiceCenter.Commands.UpdateOperatingHours;
using Autoria.features.ServiceCenter.Commands.UploadPhotos;
using Autoria.features.ServiceCenter.Commands.SubmitServiceCenter;

namespace Autoria.features.ServiceCenter
{
    public class ServiceCentersController :BaseController
    {

        public ServiceCentersController(IMediator mediator):base(mediator) { }



        [Authorize(Roles = Roles.User)]
        [HttpPost]
        public async Task<IActionResult> CreateServiceCenter([FromBody] CreateServiceCenterRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            var serviceCenterId = await _mediator.Send(new CreateServiceCenterCommand(
                userId,
                request.Name,
                request.Governorate,
                request.District,
                request.StreetAddress,
                request.Phone,
                request.BusinessEmail,
                request.YearEstablished,
                request.Description,
                request.CommercialRegNo,
                request.TaxCardNo,
                request.OwnerNationalId,
                request.OwnerFullName,
                request.NumServiceBays,
                request.Type,
                request.Latitude,
                request.Longitude
            ));

            return Success(new { serviceCenterId });
        }

        [Authorize(Roles = Roles.ServiceCenterOwner)]
        [HttpPost("my/documents")]
        public async Task<IActionResult> UploadDocuments([FromForm] UploadDocumentsRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await _mediator.Send(new UploadDocumentsCommand(
                userId,
                request.CommercialRegFile,
                request.TaxCardFile,
                request.OwnerNationalIdFile
            ));

            return Success("Documents uploaded successfully");
        }

        [Authorize(Roles = Roles.ServiceCenterOwner)]
        [HttpPut("my/service-types")]
        public async Task<IActionResult> UpdateServiceTypes([FromBody] UpdateServiceTypesRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await _mediator.Send(new UpdateServiceTypesCommand(
                userId,
                request.ServiceTypeIds
            ));

            return Success("Service types updated successfully");
        }



        [Authorize(Roles = Roles.ServiceCenterOwner)]
        [HttpPut("my/car-brands")]
        public async Task<IActionResult> UpdateCarBrands([FromBody] UpdateCarBrandsRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await _mediator.Send(new UpdateCarBrandsCommand(
                userId,
                request.CarBrandIds
            ));

            return Success("Car brands updated successfully");
        }

        [Authorize(Roles = Roles.ServiceCenterOwner)]
        [HttpPut("my/operating-hours")]
        public async Task<IActionResult> UpdateOperatingHours([FromBody] UpdateOperatingHoursRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await _mediator.Send(new UpdateOperatingHoursCommand(
                userId,
                request.OperatingHours
            ));

            return Success("Operating hours updated successfully");
        }



        //[Authorize(Roles = Roles.ServiceCenterOwner)]
        [Authorize]
        [HttpPost("my/photos")]
        public async Task<IActionResult> UploadPhotos([FromForm] UploadPhotosRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await _mediator.Send(new UploadPhotosCommand(
                userId,
                request.Photos
            ));

            return Success("Photos uploaded successfully");
        }


        [Authorize(Roles = Roles.ServiceCenterOwner)]
        [HttpPost("my/submit")]
        public async Task<IActionResult> SubmitServiceCenter()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await _mediator.Send(new SubmitServiceCenterCommand(userId));

            return Success("Service center submitted successfully");
        }

    }
}
