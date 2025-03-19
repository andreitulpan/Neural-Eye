using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NeuralEye.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public class DevicesController : ControllerBase
    {
        private static readonly List<Device> Devices = new()
        {
            new Device { Id = 1, Name = "Temperature Sensor", Type = "Sensor", Status = "Online", Location = "Warehouse A", Description = "Monitors temperature", Model = "TX-100", MqttTopic = "sensors/temperature" },
            new Device { Id = 2, Name = "Security Camera", Type = "Camera", Status = "Offline", Location = "Entrance", Description = "Entrance surveillance", Model = "CamX-360", MqttTopic = "camera/entrance" }
        };

        [HttpGet]
        public IActionResult GetDevices()
        {
            return Ok(Devices);
        }

        [HttpGet("{id}")]
        public IActionResult GetDevice(int id)
        {
            var device = Devices.FirstOrDefault(d => d.Id == id);
            if (device == null)
            {
                return NotFound();
            }
            return Ok(device);
        }

        [HttpPost]
        public IActionResult CreateDevice([FromBody] Device newDevice)
        {
            newDevice.Id = Devices.Max(d => d.Id) + 1;
            Devices.Add(newDevice);
            return CreatedAtAction(nameof(GetDevice), new { id = newDevice.Id }, newDevice);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateDevice(int id, [FromBody] Device updatedDevice)
        {
            var device = Devices.FirstOrDefault(d => d.Id == id);
            if (device == null) return NotFound();

            device.Name = updatedDevice.Name;
            device.Type = updatedDevice.Type;
            device.Status = updatedDevice.Status;
            device.Location = updatedDevice.Location;
            device.Description = updatedDevice.Description;
            device.Model = updatedDevice.Model;
            device.MqttTopic = updatedDevice.MqttTopic;

            return Ok(device);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteDevice(int id)
        {
            var device = Devices.FirstOrDefault(d => d.Id == id);
            if (device == null) return NotFound();

            Devices.Remove(device);
            return NoContent();
        }
    }

    public class Device
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string MqttTopic { get; set; } = string.Empty;
    }

}
