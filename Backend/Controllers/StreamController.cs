using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NeuralEye.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public class StreamsController : ControllerBase
    {
        private static readonly Dictionary<int, StreamInfo> StreamStates = new();

        [HttpGet("{deviceId}")]
        public IActionResult GetStream(int deviceId)
        {
            if (!StreamStates.TryGetValue(deviceId, out var stream))
            {
                stream = new StreamInfo
                {
                    DeviceId = deviceId,
                    Status = "Stopped",
                    StreamUrl = "",
                    Configuration = "Default config"
                };
            }

            return Ok(stream);
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
