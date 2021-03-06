USE [master];
GO
/* CREATE LOGIN */
CREATE LOGIN [fdatauser]
    WITH PASSWORD    = N'50c1alCar3',
    CHECK_POLICY     = OFF,
    CHECK_EXPIRATION = OFF,
	DEFAULT_LANGUAGE=[British];
GO
/* CREATE DATABASE */
CREATE DATABASE FDATA;
GO
USE FDATA;
GO
/* CREATE DB OWNER USER */
GO
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'fdatauser')
BEGIN
    CREATE USER [fdatauser] FOR LOGIN [fdatauser]
    EXEC sp_addrolemember N'db_owner', N'fdatauser'
END;
GO
/* CREATE SCHEMA */
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RESOURCE_IDENTITY_MAPS](
	[DATASET_ENTITY_ID] [int] NOT NULL,
	[DATASET_ENTITY_TYPE] [varchar](35) NOT NULL,
	[RESOURCE_ID] [varchar](85) NOT NULL,
	[RESOURCE_TYPE] [varchar](35) NOT NULL,
	[CREATED] [datetime] NOT NULL,
	[DELETED] [datetime] NULL,
 CONSTRAINT [PK_RESOURCE_IDENTITY_MAPS] PRIMARY KEY CLUSTERED 
(
	[DATASET_ENTITY_ID] ASC,
	[RESOURCE_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RESOURCE_LOAD_RESULTS]    Script Date: 19/08/2021 06:51:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RESOURCE_LOAD_RESULTS](
	[RESOURCE_LOAD_RESULT_ID] [int] IDENTITY(1,1) NOT NULL,
	[RESOURCE_LOAD_ID] [int] NOT NULL,
	[RESOURCE_ID] [varchar](85) NOT NULL,
	[RESOURCE_OPERATION] [varchar](15) NOT NULL,
	[RESULT_ID] [int] NOT NULL,
	[RESULT] [varchar](max) NOT NULL,
 CONSTRAINT [PK_RESOURCE_LOAD_RESULTS] PRIMARY KEY CLUSTERED 
(
	[RESOURCE_LOAD_RESULT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RESOURCE_LOAD_STATUSES]    Script Date: 19/08/2021 06:51:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RESOURCE_LOAD_STATUSES](
	[RESOURCE_LOAD_STATUS_ID] [int] IDENTITY(1,1) NOT NULL,
	[LOAD_STATUS] [varchar](35) NOT NULL,
 CONSTRAINT [PK_RESOURCE_LOAD_STATUSES] PRIMARY KEY CLUSTERED 
(
	[RESOURCE_LOAD_STATUS_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RESOURCE_LOADS]    Script Date: 19/08/2021 06:51:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RESOURCE_LOADS](
	[RESOURCE_LOAD_ID] [int] IDENTITY(1,1) NOT NULL,
	[RESOURCE_LOAD_STATUS_ID] [int] NOT NULL,
	[LOAD_DATE_TIME] [datetime] NOT NULL,
	[LOAD_START_DATE_TIME] [datetime] NOT NULL,
	[LOAD_COMPLETED_DATE_TIME] [datetime] NULL,
 CONSTRAINT [PK_RESOURCE_LOADS] PRIMARY KEY CLUSTERED 
(
	[RESOURCE_LOAD_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RESULTS]    Script Date: 19/08/2021 06:51:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RESULTS](
	[RESULT_ID] [int] IDENTITY(1,1) NOT NULL,
	[TEXT] [varchar](15) NOT NULL,
 CONSTRAINT [PK_RESULTS] PRIMARY KEY CLUSTERED 
(
	[RESULT_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[STAGING_BUNDLES]    Script Date: 19/08/2021 06:51:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[STAGING_BUNDLES](
	[BUNDLE_ID] [varchar](85) NOT NULL,
	[BUNDLE_DATA] [varchar](max) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[STAGING_RESOURCES]    Script Date: 19/08/2021 06:51:31 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[STAGING_RESOURCES](
	[RESOURCE_ID] [varchar](85) NOT NULL,
	[RESOURCE_DATA] [varchar](max) NOT NULL,
	[RESOURCE_OPERATION] [varchar](10) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[RESOURCE_LOAD_RESULTS]  WITH CHECK ADD  CONSTRAINT [FK_RESOURCE_LOAD_RESULTS_RESOURCE_LOADS] FOREIGN KEY([RESOURCE_LOAD_ID])
REFERENCES [dbo].[RESOURCE_LOADS] ([RESOURCE_LOAD_ID])
GO
ALTER TABLE [dbo].[RESOURCE_LOAD_RESULTS] CHECK CONSTRAINT [FK_RESOURCE_LOAD_RESULTS_RESOURCE_LOADS]
GO
ALTER TABLE [dbo].[RESOURCE_LOAD_RESULTS]  WITH CHECK ADD  CONSTRAINT [FK_RESOURCE_LOAD_RESULTS_RESULTS] FOREIGN KEY([RESULT_ID])
REFERENCES [dbo].[RESULTS] ([RESULT_ID])
GO
ALTER TABLE [dbo].[RESOURCE_LOAD_RESULTS] CHECK CONSTRAINT [FK_RESOURCE_LOAD_RESULTS_RESULTS]
GO
ALTER TABLE [dbo].[RESOURCE_LOADS]  WITH CHECK ADD  CONSTRAINT [FK_RESOURCE_LOADS_RESOURCE_LOAD_STATUSES] FOREIGN KEY([RESOURCE_LOAD_STATUS_ID])
REFERENCES [dbo].[RESOURCE_LOAD_STATUSES] ([RESOURCE_LOAD_STATUS_ID])
GO
ALTER TABLE [dbo].[RESOURCE_LOADS] CHECK CONSTRAINT [FK_RESOURCE_LOADS_RESOURCE_LOAD_STATUSES]
GO