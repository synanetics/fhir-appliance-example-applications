/* CREATE THE SERVER LOGIN (fhir_control) */
USE [master];
GO
  CREATE LOGIN master_data WITH PASSWORD = '5tMunG050nFh1R',
  CHECK_POLICY = OFF,
  CHECK_EXPIRATION = OFF;
GO
  CREATE DATABASE MASTERDATA
GO
  USE MASTERDATA;
GO
  IF NOT EXISTS (
    SELECT
      *
    FROM
      sys.database_principals
    WHERE
      name = 'master_data'
  ) BEGIN CREATE USER [master_data] FOR LOGIN [master_data] EXEC sp_addrolemember 'db_owner',
  'master_data'
END;
GO
CREATE TABLE [dbo].[ORGANIZATIONS](
	[ODS] [varchar](15) NOT NULL,
	[NAME] [varchar](185) NOT NULL,
	[ADDRESS_LINE_1] [varchar](85) NOT NULL,
	[CITY] [varchar](85) NOT NULL,
	[DISTRICT] [varchar](85) NOT NULL,
	[POSTCODE] [varchar](10) NOT NULL,
  [PROCESSED] [bit] NOT NULL
 CONSTRAINT [PK_ORGANIZATIONS] PRIMARY KEY CLUSTERED 
(
	[ODS] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT INTO dbo.ORGANIZATIONS (ODS, NAME, ADDRESS_LINE_1, CITY, DISTRICT, POSTCODE, PROCESSED) VALUES ('L85006','CROWN MEDICAL CENTRE', 'CROWN INDUSTRIAL ESTATE', 'TAUNTON', 'SOMERSET', 'TA2 8QY', 0)
INSERT INTO dbo.ORGANIZATIONS (ODS, NAME, ADDRESS_LINE_1, CITY, DISTRICT, POSTCODE, PROCESSED) VALUES ('L85066','BUTTERCROSS HEALTH CENTRE','BEHIND BERRY', 'SOMERTON', 'SOMERSET', 'TA11 7PB', 0)
INSERT INTO dbo.ORGANIZATIONS (ODS, NAME, ADDRESS_LINE_1, CITY, DISTRICT, POSTCODE, PROCESSED) VALUES ('L85020',' BECKINGTON FAMILY PRACTICE','ST. LUKES ROAD', 'FROME', 'SOMERSET', 'BA11 6SE', 0)
GO
CREATE TABLE [dbo].[PRACTITIONERS](
	[GMC] [varchar](15) NOT NULL,
	[FAMILY] [varchar](85) NOT NULL,
	[GIVEN] [varchar](85) NOT NULL,
	[PREFIX] [varchar](5) NOT NULL,
	[GENDER] [varchar](5) NOT NULL,
  [PROCESSED] [bit] NOT NULL
 CONSTRAINT [PK_PRACTITIONERS] PRIMARY KEY CLUSTERED 
(
	[GMC] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT INTO dbo.PRACTITIONERS (GMC, FAMILY, GIVEN, PREFIX, GENDER, PROCESSED) VALUES ('G999991', 'STARK', 'BRAN', 'DR.', 'male', 0)
INSERT INTO dbo.PRACTITIONERS (GMC, FAMILY, GIVEN, PREFIX, GENDER, PROCESSED) VALUES ('G999992', 'BARATHEON', 'STANNIS', 'DR.', 'male', 0)