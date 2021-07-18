/* CREATE THE SERVER LOGIN (fhir_control) */
USE [master];
GO
  CREATE LOGIN iamnode WITH PASSWORD = '5tMunG050nFh1R',
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