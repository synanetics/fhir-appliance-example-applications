USE [master];
GO
  CREATE LOGIN iamnode WITH PASSWORD = 'DStUVXLWJe3zRFhp',
  CHECK_POLICY = OFF,
  CHECK_EXPIRATION = OFF;
GO
  CREATE DATABASE fhirstore
GO
  USE fhirstore;
GO
  IF NOT EXISTS (
    SELECT
      *
    FROM
      sys.database_principals
    WHERE
      name = 'iamnode'
  ) BEGIN CREATE USER [iamnode] FOR LOGIN [iamnode] EXEC sp_addrolemember 'db_owner',
  'iamnode'
END;
GO