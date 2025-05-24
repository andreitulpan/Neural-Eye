using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.DataProtection;
using NeuralEye.Data;
using NeuralEye.Models;
using System.Text;
using NeuralEye.Services;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi();

// Register JwtSettings configuration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(o =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
    Console.WriteLine($"Issuer: {jwtSettings?.Issuer}, Audience: {jwtSettings?.Audience}");
    o.RequireHttpsMetadata = false; // Allow HTTP during development
    o.SaveToken = true; // Ensure tokens are saved for validation
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings!.Issuer,
        ValidAudience = jwtSettings!.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings!.SecretKey!))
    };

    o.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine("Authentication failed: " + context.Exception.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully.");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

// Add authentication services
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateLifetime = true,
//            ValidateIssuerSigningKey = true,
//            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
//            ValidIssuer = jwtSettings.Issuer,
//            ValidAudience = jwtSettings.Audience
//        };
//    });

//var requireAuthPolicy = new AuthorizationPolicyBuilder()
//    .RequireAuthenticatedUser()
//    .Build();
//builder.Services.AddAuthorizationBuilder()
//    .SetDefaultPolicy(requireAuthPolicy);

// Configure SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Add ASP.NET Core Identity services
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Add authorization policies
//builder.Services.AddAuthorization(options =>
//{
//    // Default policy that requires authentication
//    options.FallbackPolicy = options.DefaultPolicy;
//});

// Configure Data Protection to store keys in /root/.aspnet/DataProtection-Keys
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo("/root/.aspnet/DataProtection-Keys"))
    .SetApplicationName("NeuralEye");

// Add services to the container.
builder.Services.AddControllers();

// Add Swagger support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer {your JWT token}'"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


builder.Services.AddHostedService<MqttService>();
builder.Services.AddSingleton<ILatestImageStore, LatestImageStore>();
builder.Services.AddSingleton<IWebSocketHandler, WebSocketHandler>();

// Configure Kestrel to use HTTP on port 5001 only
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5001);
});

var app = builder.Build();

var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(120)
};
app.UseWebSockets(webSocketOptions);

// HTTPS route
app.MapGet("/", () => "Hello over HTTPS!");


app.Map("/ws", async context =>
{
    var webSocketManager = context.RequestServices.GetRequiredService<WebSocketHandler>();

    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        return;
    }

    var webSocket = await context.WebSockets.AcceptWebSocketAsync();
    await webSocketManager.AddSocketAsync(webSocket);

    var buffer = new byte[1024 * 4];
    WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

    while (!result.CloseStatus.HasValue)
    {
        result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    }

    await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
    await webSocketManager.RemoveSocketAsync(webSocket);
});



// Use HTTPS redirection middleware
app.UseHttpsRedirection();

// Use Swagger middleware in development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(cors =>
{
    cors.AllowAnyOrigin();
    cors.AllowAnyHeader();
    cors.AllowAnyMethod();
});


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
