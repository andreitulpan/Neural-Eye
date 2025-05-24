using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NeuralEye.Services;

namespace NeuralEye.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public class StreamController : ControllerBase
    {
        private readonly ILatestImageStore _imageStore;
        public StreamController(ILatestImageStore imageStore)
        {
            _imageStore = imageStore;
        }

        private static readonly Dictionary<int, StreamInfo> StreamStates = new();

        [HttpGet("image/{deviceId}")]
        public IActionResult GetStream(int deviceId)
        {
            var image = _imageStore.LatestImage;

            return Ok("test");
        }

        [HttpPost("{deviceId}/start")]
        public IActionResult StartStream(int deviceId)
        {
            var stream = new StreamInfo
            {
                DeviceId = deviceId,
                Status = "Running",
                StreamUrl = $"https://streams.example.com/device/{deviceId}",
                Configuration = "1080p, 30fps"
            };

            StreamStates[deviceId] = stream;
            return Ok(stream);
        }

        [HttpPost("{deviceId}/stop")]
        public IActionResult StopStream(int deviceId)
        {
            if (StreamStates.ContainsKey(deviceId))
            {
                StreamStates[deviceId].Status = "Stopped";
                StreamStates[deviceId].StreamUrl = "";
            }
            return Ok(new { DeviceId = deviceId, Status = "Stopped" });
        }
    }

    public class StreamInfo
    {
        public int DeviceId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string StreamUrl { get; set; } = string.Empty;
        public string Configuration { get; set; } = string.Empty;
    }
}
