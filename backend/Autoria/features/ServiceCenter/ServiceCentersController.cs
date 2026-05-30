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
using Autoria.features.ServiceCenter.Commands.ApproveServiceCenter;
using Autoria.features.ServiceCenter.Commands.RejectServiceCenter;
using Autoria.features.ServiceCenter.Querys.GetPendingServiceCenters;
using Autoria.features.ServiceCenter.Querys.GetMyServiceCenter;
using Autoria.features.ServiceCenter.Querys.GetServiceCenterById;
using Autoria.features.ServiceCenter.Querys.GetAllServiceCenters;
using Autoria.features.ServiceCenter.Commands.UpdateMyServiceCenter;
using Autoria.features.ServiceCenter.Commands.DeleteServiceCenter;
using Autoria.features.ServiceCenter.Dtos;
using Autoria.shared.Dtos;
using Autoria.shared.Enums;
using Autoria.features.ServiceCenter.Commands.UpdateServiceCenterLocation;
using Autoria.Features.ServiceCenters.MatchServiceCenters;

namespace Autoria.features.ServiceCenter
{
    public class ServiceCentersController :BaseController
    {

        public ServiceCentersController(IMediator mediator):base(mediator) { }



        //[Authorize(Roles = Roles.User)]
        [HttpPost]
        public async Task<IActionResult> CreateServiceCenter([FromBody] CreateServiceCenterRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            var serviceCenterId = await _mediator.Send(new CreateServiceCenterCommand(
                userId,
                request.Name,
                request.Phone,
                request.BusinessEmail,
                request.YearEstablished,
                request.Description,
                request.CommercialRegNo,
                request.TaxCardNo,
                request.OwnerNationalId,
                request.OwnerFullName,
                request.NumServiceBays,
                request.Type
            ));

            return Success(new { serviceCenterId });
        }

        //[Authorize(Roles = Roles.ServiceCenterOwner )]
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

        //[Authorize(Roles = Roles.ServiceCenterOwner)]
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



        //[Authorize(Roles = Roles.ServiceCenterOwner)]
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

        //[Authorize(Roles = Roles.ServiceCenterOwner)]
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


        //[Authorize(Roles = Roles.ServiceCenterOwner)]
        [HttpPost("my/submit")]
        public async Task<IActionResult> SubmitServiceCenter()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await _mediator.Send(new SubmitServiceCenterCommand(userId));

            return Success("Service center submitted successfully");
        }


        [Authorize(Roles = Roles.Admin)]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingServiceCenters([FromQuery] GetPendingServiceCentersQuery query)
        {
            var result = await _mediator.Send(query);
            return Success(result);
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveServiceCenter(Guid id)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _mediator.Send(new ApproveServiceCenterCommand(adminId, id));
            return Success("Service center approved successfully");
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectServiceCenter(Guid id, [FromBody] RejectServiceCenterRequest request)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _mediator.Send(new RejectServiceCenterCommand(adminId, id, request.RejectionReason));
            return Success("Service center rejected successfully");
        }


        [Authorize(Roles = Roles.ServiceCenterOwner)]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyServiceCenter()
        {
            var result = await _mediator.Send(new GetMyServiceCenterQuery());
            return Success(result);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceCenterById(Guid id)
        {
            var result = await _mediator.Send(new GetServiceCenterByIdQuery(id));
            return Success(result);
        }



        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] ServiceCenterType? type = null,
        [FromQuery] Guid? serviceTypeId = null,
        [FromQuery] Guid? carBrandId = null,
        [FromQuery] double? latitude = null,
        [FromQuery] double? longitude = null)
        {
            var result = await _mediator.Send(new GetAllServiceCentersQuery(
                page, pageSize, search, type, serviceTypeId, carBrandId, latitude, longitude));

            return Success(result);
        }


        [Authorize(Roles = Roles.ServiceCenterOwner)]
        [HttpPut("my")]
        public async Task<IActionResult> UpdateMyServiceCenter([FromBody] UpdateMyServiceCenterCommand command)
        {
            await _mediator.Send(command);
            return Success("Service center updated successfully");
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteServiceCenter(Guid id)
        {
            await _mediator.Send(new DeleteServiceCenterCommand(id));
            return Success("Service center deleted successfully");
        }



        [HttpPut("my/location")]
        //[Authorize(Roles = Roles.ServiceCenterOwner)]
        public async Task<IActionResult> UpdateLocation(Guid id, [FromBody] UpdateServiceCenterLocationRequest request)
        {
            await _mediator.Send(new UpdateServiceCenterLocationCommand(id, request.Latitude, request.Longitude, request.Address));
            return Success("Location updated successfully");
        }


        [Authorize]
     

            [HttpPost("match")]
            public async Task<IActionResult> Match([FromBody] MatchServiceCentersCommand command)
            {
                var result = await _mediator.Send(command);
                return Success( result,"success");
            }
        
    }
}
