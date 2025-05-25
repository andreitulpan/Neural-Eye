using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuralEye.Data;
using NeuralEye.Models;
using NeuralEye.Services;

namespace NeuralEye.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public class StreamController : ControllerBase
    {
        private readonly ILatestImageStore _imageStore;
        private readonly ITextExtractionService _textExtractionService;
        private readonly IRepository<Image> _imagesRepository;

        public StreamController(ILatestImageStore imageStore, ITextExtractionService textExtractionService, IRepository<Image> imagesRepository)
        {
            _imageStore = imageStore;
            _textExtractionService = textExtractionService;
            _imagesRepository = imagesRepository;
        }


        [HttpPost("saveimage")]
        public async Task<IActionResult> SaveImageAndExtractText([FromBody] ImageOCR imageOCR)
        {
            var extractedText = _textExtractionService.ExtractText(imageOCR.Image);

            var image = new Image
            {
                UserId = imageOCR.UserId,
                ImageData = _textExtractionService.ConvertHexStringToByteArray(imageOCR.Image),
                ExtractedText = extractedText
            };

            await _imagesRepository.AddAsync(image);

            return Ok(extractedText);
        }

        [HttpGet("getimages/{userId}")]
        public async Task<IActionResult> GetImages(string userId)
        {
            var imagesForUser = await _imagesRepository.GetWhereAsync(x => x.UserId == userId);

            return Ok(imagesForUser);
        }
    }

}
