# Bias Detection and Visualization Tool - CashApp

[![Netlify Status](https://api.netlify.com/api/v1/badges/9d9acd0b-6a91-4ec6-9320-88890ccc00eb/deploy-status?color=brightgreen)](https://app.netlify.com/sites/cash-app-bias-busters/deploys)
[![Python](https://img.shields.io/badge/Python-blueviolet)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-deeppink)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-dodgerblue)](https://www.mysql.com/)
[![Flask](https://img.shields.io/badge/Flask-darkorange)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/MIT_License-brightgreen)](https://opensource.org/licenses/MIT)

<div style="text-align: center;">
  <img src="frontend/public/cash-app-logo.png" alt="CashApp Logo" width="100"/>
</div>

### Links

- [**Frontend**](https://cash-app-bias-busters.netlify.app/)
- [**Backend**](https://cash-app-bias-busters.onrender.com/)

> **Note**: The backend may take up to a minute to start up on the first visit.

## Overview

As part of the 2024 cohort of the Technology Leadership Initiative, we developed a platform in collaboration with **Cash App** to assist machine learning engineers in identifying and visualizing biases in their models.

- Users can upload their transaction data and approval models, which are processed by a Flask-based backend utilizing the Fairlearn library to detect biases.
- The results are intuitively visualized on the frontend using dynamic charts powered by Chart.js.
- The platform allows users to select key demographic categories such as gender, age, and race and further refine these by specifying subcategories (e.g., age ranges like 18–25).
- Additionally, users can upload multiple models to compare biases across different demographic categories and models, providing a comprehensive understanding of their systems' performance and fairness.
- Built with a focus on clean architecture, SOLID principles and software design patterns, the platform ensures a modular and maintainable design with extensive testing coverage.

<div style="text-align: center;">
  <img width="1468" alt="Main Dashboard" src="https://github.com/user-attachments/assets/89cd04a9-bfed-4cfd-bf40-3f90cbc70e2d">
</div>

## Index

1. [Problem Statement](#problem-statement)
2. [Motivation](#motivation)
3. [Features](#features)
4. [Technical Implementation Details](#technical-implementation-details)
5. [API Endpoints](#api-endpoints)
6. [Directory Structure](#repository-structure)
7. [How to Use](#how-to-use)
8. [How to Install](#how-to-install)
9. [Contributors](#contributors)  
10. [Contributing & Feedback](#contributing--feedback)
11. [Acknowledgements/Credits](#acknowledgementscredits)

## Problem Statement

Ensuring fairness in AI systems is a critical challenge for organizations like Cash App, especially when decisions impact individuals based on sensitive demographic factors such as age, gender, and race. Without intuitive tools, identifying and addressing biases in transaction approval models becomes a complex and time-intensive task for machine learning engineers, potentially leading to unfair or discriminatory outcomes.

## Motivation

With the increasing integration of AI systems in sensitive applications like financial transactions, ensuring fairness and mitigating biases is crucial. This project addresses the need for tools that allow ML practitioners to identify and visualize potential biases in their models, thus enabling informed decisions to improve fairness in AI.

Our backend analyzes the bias in the selected demographic categories using the Fairlearn library. The results are visualized in intuitive, easy-to-understand graphs created using Chart.js on the frontend.

## Features

- <b>Bias Analysis:</b> Detect bias in transaction approval models for a custom selection of demographic categories using Fairlearn.
- <b>Interactive Dashboard:</b> User-friendly interface to import data and select demographic groups, with a chatbot and tutorial.
- <b>Visualizations:</b> Generate intuitive graphs and charts using Chart.js for detailed insights of bias in particular demographics.
- <b>Model Comparison:</b> Easily compare fairness metrics across different models.
- **Share**: Share your bias analysis with colleagues via a QR code.
- **Account Management**: Secure user authentication (login/signup) and account management to ensure data privacy and personalized access.
- **Accessibility Services**: Accessibility services have been incorporated for ease of use and inclusiveness.

<div style="text-align: center;">
  <img width="1468" alt="Model Tester Dashboard" src="https://github.com/user-attachments/assets/0df3a9ba-fdab-44a1-ab55-08bd821de31b">

## Technical Implementation Details

- **Backend**: Built using Python with the Flask framework, the backend handles data processing and bias detection. Hosted on **Render**.

  - **Packages Used**:
    - `numpy`: For numerical computations and matrix operations used in model analysis.
    - `pandas`: For handling and preprocessing data.
    - `scikit-learn`: For building and training the machine learning models.
    - `scipy`: For advanced statistical computations required in analysis.
    - `mysql-connector`: To establish a connection with the MySQL database and execute queries.
    - `pytest` and `unittest`: For unit testing the backend to ensure robust and error-free functionality.

- **Frontend**: Built using React and Vite, the frontend is responsible for the interactive dashboard and visualizations. Hosted on **Netlify**.

  - **Packages Used**:
    - `react-joyride`: To implement an onboarding tutorial that guides first-time users with step-by-step instructions on using the platform.
    - `sweetalert2`: For displaying elegant and customizable alerts, such as login prompts or error messages.
    - `axios-retry`: To automatically retry failed API requests to the backend, ensuring smooth user experience even under intermittent connectivity.
    - `jest`: For testing the frontend

- **Database**: We use **MySQL** to store all the data uploaded by users. The database is hosted on **Aiven**.

- **Fairlearn**: This Python library is used for detecting and assessing fairness in ML models.

- **Chart.js**: Used to render dynamic and interactive graphs and charts to visualize bias metrics.

- **Clean Architecture, SOLID Principles and Design Patterns**:  
  The project follows **Clean Architecture** by layers, organizing the system into separate layers such as presentation, business logic, and data access. This ensures the application's modularity, maintainability, and scalability. Additiaonlly, we have incorporated all SOLID principles as well as design patterns like Facade and Dependency Injection.

- **Testing:**  
  We used **pytest** and **unittest** for unit and integration testing. Pytest ensures the correctness of the application’s logic by automating tests for backend functionality, database interactions, and model processing. Additionally, we used **React Testing Library (RTL)** and **Jest** for frontend testing by mocking data to simulate user interactions and validate component behavior.

<img width="1006" alt="Tech Stack" src="https://github.com/user-attachments/assets/5bf302d0-cac9-484a-bfc6-5e9845c0b7b9">

<img width="987" alt="Fairlearn Explanation" src="https://github.com/user-attachments/assets/3ad68c6e-422c-45e0-bf43-0368db7438fb">

## API Endpoints

- **`/api/headers`**: Fetches demographic categories from the database.
- **`/api/values-under-header`**: Retrieves subcategories within a demographic category.
- **`/api/generate`**: Generates bias graph data for selected inputs.
- **`/api/get-prev-data`**: Retrieves previously saved data for the user.
- **`/api/upload-data`**: Handles transaction data uploads.
- **`/api/upload-model`**: Uploads a transaction approval model.
- **`/api/generate-for-all-models`**: Generates bias data for all uploaded models.
- **`/api/delete-model`**: Deletes a specified model.
- **`/signup`**: Registers a new user.
- **`/login`**: Authenticates and logs in a user.
- **`/logout`**: Logs out the current user.
- **`/get-email`**: Retrieves the logged-in user's email.
- **`/change_password`**: Updates the account password.
- **`/share/<encoded_data>`**: Generates a shareable link for collaboration.

## Repository Structure

Below is an overview of the folder structure for this repository to help you navigate and contribute effectively:

### Backend:

```plaintext
backend/
├── app/                     # Core application code and logic
│   ├── controllers/         # Handle incoming requests and responses
│   ├── entities/            # Core business objects and domain logic
│   ├── infrastructure/      # Frameworks and tools for external integrations
│   ├── repositories/        # Interfaces for data storage and retrieval
│   └── use_cases/           # Application-specific business logic
├── ml_model/                # Codebase for the scikit-learn ML model
│   ├── entities/            # Core objects for model logic
│   ├── infrastructure/      # Defining the core data points
│   ├── repository/          # Data storage and interaction logic for the model
│   ├── use_cases/           # Model-specific business logic
│   └── utility/             # Helper functions and utilities for ML tasks
├── uploads/                 # Folder for storing data uploads
├── tests/                   # Unit and integration test scripts
└── requirements.txt         # Backend dependencies
```

### Frontend:

```plaintext
frontend/
├── public/                  # Public assets (e.g., index.html, icons)
├── src/                     # Source code for the React application
│   ├── app/                 # Core application logic and configurations
│   ├── components/          # Reusable UI components
│   ├── layout/              # Layout-related components (e.g., header, footer)
│   ├── pages/               # Application pages
├── tests/                   # Frontend test scripts (using RTL and Jest)
├── .env                     # Environment variables
├── package.json             # Dependencies for the frontend
└── README.md                # Frontend-specific documentation
```

## How to use

If you want to use the project, simply visit the publicly hosted website: [https://cash-app-bias-busters.netlify.app](https://cash-app-bias-busters.netlify.app).

The backend is hosted on render and can be accessed through the publicly available link [https://cash-app-bias-busters.onrender.com](https://cash-app-bias-busters.onrender.com)

**NOTE:** The backend may take up to a minute to start up on the first visit.

## How to Install

### System Requirements

Before setting up the project, ensure your system meets the following requirements:

- **Operating System**: Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+ recommended)
- **Node.js**: Version 16.x or higher
- **Python**: Version 3.9 or higher
- **MySQL**: Version 8.0 or higher (for local database setup)
- **Browser**: Latest versions of Chrome, Firefox, or Edge
- **Package Manager**: npm or yarn

Optional:

- **Vite CLI**: Recommended for efficient frontend development

If you'd like to run it locally instead, follow these steps:

### Installation Steps:

1. Clone the repository:

```
git clone https://github.com/Jai0212/Cash-App-Bias-Busters.git
```

2. Backend:

```
pip install -r backend/requirements.txt
python3 -m backend.app.controllers.app
```

3. Frontend

```
cd frontend
npm run dev
````

> Safety and data confidentiality is our topmost priority so we are not publicly revealing our environment variables which contain our database credentials, datasets models, etc. If you wish to run locally, you must contact us (any contributor via GitHub) and if for a viable reason, we will provide these details.

## Contributors
<a href="https://github.com/Jai0212/Cash-App-Bias-Busters/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Jai0212/Cash-App-Bias-Busters"/>
</a>

## Contributing & Feedback

We value your feedback and contributions to improve this project! Below are the ways you can provide feedback or contribute:

### Providing Feedback

- **Issues**: Found a bug or have a feature request? Feel free to create an issue [here](https://github.com/Jai0212/Cash-App-Bias-Busters/issues).

### How to contribute

We welcome contributions from the community! Follow the steps below to get started:

1. **Fork the Repository**:

   - Click the **Fork** button in the top-right corner of the repository on GitHub.
   - Clone your fork locally:
     ```bash
     git clone https://github.com/your-username/Cash-App-Bias-Busters.git
     cd Cash-App-Bias-Busters
     ```

2. **Create a New Branch**:

   - Create a branch for your feature or fix:
     ```bash
     git checkout -b feature/your-feature-name
     ```

3. **Make Your Changes**:

   - Write clear, concise, and well-documented code.
   - Follow the existing project structure and conventions.

4. **Submit a Pull Request (PR)**:
   - Push your branch to your fork:
     ```bash
     git push origin feature/your-feature-name
     ```
   - Open a pull request on the original repository with a clear description of your changes and their purpose.

### Contribution Guidelines

- **Merge Request Quality**:

  - Ensure your PR includes detailed commit messages and a description of what problem it solves or feature it adds.
  - Include tests where applicable and ensure your code does not break existing functionality.

- **Review Process**:
  - After submitting your PR, our team will review it.
  - We follow a collaborative review process and may request changes before merging.

Your contributions make a difference, and we appreciate your time and effort in improving the project!

## Acknowledgements/Credits

1. This project makes use of the Fairlearn library for bias detection and fairness assessments.

```
@misc{weerts2023fairlearn,
title={Fairlearn: Assessing and Improving Fairness of AI Systems},
author={Hilde Weerts and Miroslav Dudík and Richard Edgar and Adrin Jalali and Roman Lutz and Michael Madaio},
journal={Journal of Machine Learning Research},
year={2023},
volume={24},
number={257},
pages={1--8},
url={http://jmlr.org/papers/v24/23-0389.html}
}
```

2. Special thanks to [Cash App](https://www.cash.app) for their collaboration and support in this initiative.


> For more info, see `supplementary/supplementary.md`
