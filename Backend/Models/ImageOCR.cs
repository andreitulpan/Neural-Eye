using Newtonsoft.Json;

namespace NeuralEye.Models
{
    public class ImageOCR
    {
        [JsonProperty("image")]
        public string Image { get; set; } = string.Empty;

        [JsonProperty("user_id")]
        public int UserId { get; set; }
    }
}
