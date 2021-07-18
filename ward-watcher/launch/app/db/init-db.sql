/* CREATE THE SERVER LOGIN (fhir_control) */
USE [master];
GO
  CREATE LOGIN ward_watcher WITH PASSWORD = '5tMunG050nFh1R',
  CHECK_POLICY = OFF,
  CHECK_EXPIRATION = OFF;
GO
  CREATE DATABASE WARDWATCHER
GO
  USE WARDWATCHER;
GO
  IF NOT EXISTS (
    SELECT
      *
    FROM
      sys.database_principals
    WHERE
      name = 'ward_watcher'
  ) BEGIN CREATE USER [ward_watcher] FOR LOGIN [ward_watcher] EXEC sp_addrolemember 'db_owner',
  'ward_watcher'
END;
GO