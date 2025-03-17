USE master;
GO
-- Create a login at the SQL Server level
CREATE LOGIN neural_eye_user WITH PASSWORD = '***************';
GO

-- Switch to NeuralEyeDB
USE NeuralEyeDB;
GO

-- Create a user for the login in the database
CREATE USER neural_eye_user FOR LOGIN neural_eye_user;
GO

-- Grant only necessary permissions
ALTER ROLE db_datareader ADD MEMBER neural_eye_user;  -- Read access
ALTER ROLE db_datawriter ADD MEMBER neural_eye_user;  -- Write access
GO
