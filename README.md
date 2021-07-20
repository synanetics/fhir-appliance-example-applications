# Example FHIR Appliance applications

A collection of example applications that demonstrate the use of the FHIR Appliance created as part of the Yorkshire and Humber Care Record. The collection will grow over time and is very much a work in progress.

For more information about the Yorkshire and Humber Care Record, visit: [Yorkshire and Humber Care Record](https://yhcr.org)  

# What is the FHIR Appliance?

The FHIR Appliance is a FHIR server which was built by, and for, the [Yorkshire and Humber Care Record](https://yhcr.org). The work was carried out by the (YHCR) project team as part of their work with the [NHS England Local Health and Care Record Exampler](https://www.england.nhs.uk/publication/local-health-and-care-record-exemplars/) (LHCRE) programme. 

The FHIR Appliance has been developed in accordance to a series of [technical papers](https://yhcr.org/downloads/) produced by the [YHCR](https://yhcr.org). Each design paper describes a set of "model" software components and architectures that, when realised, can enable health and social care organisations to share data using [FHIR](https://www.hl7.org/fhir/STU3/). 

The FHIR Appliance will keep evolving in step with both the LHCRE, YHCR and other NHS regional shared care record programmes. The overall aim, however, is that the server will provide an out of the box, open source solution to health and social care organisations who require the ability to share data using FHIR.

Visit [Yorkshire and Humber Care Record FHIR Appliance](https://github.com/yorkshire-and-humber-care-record/fhir-appliance) for further information.


# Overview

This collection is under development but will use a stack of open source software and health care interoperability standards, namely:

[Fast Healthcare Interoperable Resources - FHIR](https://fhir.hl7.org.uk)
Fast Healthcare Interoperability Resources is a standard describing data formats and elements and an application programming interface for exchanging electronic health records. The standard was created by the Health Level Seven International health-care standards organization.

[Node.js](https://nodejs.org/en/)
Node.js is an asynchronous event-driven JavaScript runtime designed to build scalable network applications.

[Moleculer.js](https://moleculer.services)
A Progressive microservices framework for Node.js.

[PostgreSQL](https://www.postgresql.org)
PostgreSQL, also known as Postgres, is a free and open-source relational database management system emphasizing extensibility and technical standards compliance. It is designed to handle a range of workloads, from single machines to data warehouses or Web services with many concurrent users.

[Microsoft SQL Server](https://www.microsoft.com/en-gb/sql-server)
Microsoft SQL Server, often called "sequel server", is a commercial product developed and maintained by Microsoft. The FHIR Appliance can work with Express editions.

[Docker](https://www.docker.com)
Docker is a set of coupled software-as-a-service and platform-as-a-service products that use operating-system-level virtualization to develop and deliver software in packages called containers.

[Nextgen Healthcare Mirth Connect](https://github.com/nextgenhealthcare/connect)
Some of example applications demonstrate healthcare integration topics such as transformation using freely available integration engine software. Mirth Connect is used where this is necessary.

# Getting started

Each example application will automatically carry out any necessary configuration and setup of third party dependencies. There should be no requirement to install any software other than the following prerequisites:

[Node.js](https://nodejs.org/en/)

[Docker Desktop](https://www.docker.com/products/docker-desktop)

[Docker Compose](https://docs.docker.com/compose/install/)

[VS Code](https://code.visualstudio.com/)

Although not required, a git client is also helpful. There are many git clients around, including [GitHub Desktop](https://desktop.github.com/)

# About the examples

Each of the example applications were intended to aid the development of FHIR based healthcare applications. The applications were created to assist developers who may have had limited exposure to the FHIR standard but tasked with completing development projects for the Yorkshire and Humber Care Record

Each application contains installation, setup and configuration instructions.

> The examples should be run using a local install of Docker Desktop (Linux Containers). Windows containers are not supported.

### Ward Watcher

A simple web based application that uses FHIR resources to display information about current inpatients at a fictional NHS trust (a very basic bed state). Encounter resources are created from HL7v2 ADT messages.

[View the code](https://github.com/synanetics/fhir-appliance-example-applications/tree/master/ward-watcher)