# Social Care Data Provision

Two simple SSIS packages that transform example social care datasets extracted from a Microsoft SQL Server Database into FHIR Patient and EpisodeOfCare resources. The FHIR resources are sent as a batch (Bundle) to a FHIR Appliance where they are persisted.

The SSIS packages use the [fire.ly .NET SDK](https://docs.fire.ly/projects/Firely-NET-SDK/index.html) to create and manipulate FHIR STU3 Patient, Bundle and EpisodeOfCare resources.

> This example is designed to run on a developer workstation/windows 2019 server that hosts a Microsoft SQL Server and has SQL Server Integration Services installed.

> Passwords provided are not used outside of the application. You can change passwords as required - passwords provided are for convenience.

## Contents

[Prerequisites](#prequisites)

[Debug Settings](#debug-settings)

[Run the app](#run-the-app)

[View the code](#view-the-code)

## Prerequisites

[Microsoft SQL Server 2019 (Developer Edition)](https://go.microsoft.com/fwlink/?linkid=866662)

[Microsoft SQL Server Integration Services](https://docs.microsoft.com/en-us/sql/integration-services/sql-server-integration-services?view=sql-server-ver15)

[Visual Studio 2017 SQL Server Data Tools (SSDT)](https://docs.microsoft.com/en-us/sql/ssdt/download-sql-server-data-tools-ssdt?view=sql-server-ver15#ssdt-for-vs-2017-standalone-installer)

[Docker Desktop](https://www.docker.com/products/docker-desktop)

[Docker Compose](https://docs.docker.com/compose/install/)

[Postman](https://getpostman.com) (optional)

[VS Code](https://code.visualstudio.com/) (optional)

## Run the App

Once you have the prerequisites installed:

1. Download and extract the [FHIR Appliance Example Applications](https://github.com/synanetics/fhir-appliance-example-applications/archive/refs/heads/master.zip) repository to a directory on your local machine.

2. Open a Powershell or DOS Command Prompt and change directory to `[repository-location]/social-care-data-provision/launch/fhir` (where `[repository-location]` is the location of the repository on your local machine)

3. Run the FHIR Appliance by entering `docker-compose -p social-care-fhir-appliance up`

4. Launch Microsoft SQL Server Management Studio

5. Open `[repository-location]/social-care-data-provision/launch/databases/init-adult-social-care-db.sql` and execute the script.

6. Open `[repository-location]/social-care-data-provision/launch/databases/init-fdata.sql` and execute the script.

7. Launch Visual Studio 2017 SQL Server Data Tools and open `[repository-location]/social-care-data-provision/social-care/SocialCare.sln`

8. When prompted, enter password `50c1alCar3`

9. Open either the `Persons.dstx` or `ServiceProvision.dstx` package and click the `Start` button.

> You may need to fix up the references in each Script Task as unlike Visual Studio, references to external libraries are lost when you stop editing the Script Task. You can do this by editing the script task and, when open, right clicking `References` and `Add Reference...` in `Solution Explorer`. From the `Add Reference` window, click browse and add all the `.dll` files in `[repository-location]/social-care-data-provision/ssis/libraries`.

## View the code

1. The SSIS project is located in the `[repository-location]/social-care-data-provision/ssis/SocialCare.sln` folder and can be opened in [Visual Studio 2017 SQL Server Data Tools (SSDT)](https://docs.microsoft.com/en-us/sql/ssdt/download-sql-server-data-tools-ssdt?view=sql-server-ver15#ssdt-for-vs-2017-standalone-installer).

2. The example database scripts are located in `[repository-location]/social-care-data-provision/launch/databases/`