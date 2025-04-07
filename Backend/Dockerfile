# Use the official .NET SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set the working directory in the container
WORKDIR /app

# Copy the entire project files into the container
COPY . ./

# Restore the dependencies
RUN dotnet restore NeuralEye.csproj

# Build and publish the application (without --no-restore)
RUN dotnet publish NeuralEye.csproj -c Release -o /app/publish

# Use a smaller runtime image for deployment
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

# Set the working directory in the runtime image
WORKDIR /app

# Expose necessary ports
EXPOSE 8080

# Copy the published application from the build image
COPY --from=build /app/publish .

# Define the entry point for the container
ENTRYPOINT ["dotnet", "NeuralEye.dll"]

# Workflow test
